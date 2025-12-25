import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import StorePage from './pages/StorePage';
import AllProductsPage from './pages/AllProductsPage'; 
import VerifyPage from './pages/VerifyPage'; 
import ProductDetailPage from './pages/ProductDetailPage'; 
import MyOrdersPage from './pages/MyOrdersPage';
import ProfilePage from './pages/ProfilePage';
import AuthModal from './components/AuthModal';
import CartModal from './components/CartModal'; 
import CheckoutSuccessModal from './components/CheckoutSuccessModal';
import { AuthProvider, useAuth } from './context/AuthContext'; 
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'; 
import Footer from './components/Footer'; 
import BackgroundGradient from './components/BackgroundGradient'; 
import LogoutAnimation from './components/LogoutAnimation'; 
import GlobalLoader from './components/GlobalLoader'; 

// Lazy load admin components
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminRoute = React.lazy(() => import('./components/AdminRoute'));

// --- PageWrapper Component ---
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ type: "spring", damping: 20, stiffness: 100 }}
  >
    {children}
  </motion.div>
);

function AppContent() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); 
  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const openCartModal = () => setIsCartModalOpen(true);
  const closeCartModal = () => setIsCartModalOpen(false);
  
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const openSuccessModal = () => setIsSuccessModalOpen(true);
  const closeSuccessModal = () => setIsSuccessModalOpen(false);

  const location = useLocation();
  const { isLoggingOut } = useAuth();

  // --- SPLASH SCREEN STATE ---
  const [showSplash, setShowSplash] = useState(true);
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    // 1. KILL THE OLD LOADER (The one in index.html)
    const oldLoader = document.getElementById('loader');
    if (oldLoader) {
      // We hide it immediately because React has mounted
      oldLoader.style.display = 'none'; 
    }

    // 2. HANDLE THE NEW LOTTIE SPLASH SCREEN
    // Wait 2.5 seconds, then fade out the React Splash
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <MotionConfig reducedMotion="user"> 
      <div className="bg-brand-secondary text-brand-primary font-sans min-h-screen flex flex-col relative isolate overflow-x-hidden"> 
        
        {/* --- GLOBAL LOTTIE LOADER --- */}
        <AnimatePresence mode="wait">
          {showSplash && <GlobalLoader key="splash" />}
        </AnimatePresence>

        {/* Only render the app once the splash is fading out/gone */}
        {!showSplash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col min-h-screen"
          >
            {/* Global Animations */}
            <LogoutAnimation isLoggingOut={isLoggingOut} />
            {!isAdminRoute && <BackgroundGradient />}
            
            {/* Navbar */}
            {!isAdminRoute && (
              <Navbar openModal={openAuthModal} openCartModal={openCartModal} />
            )}
            
            <AnimatePresence mode='wait'> 
              {isAuthModalOpen && <AuthModal closeModal={closeAuthModal} />}
            </AnimatePresence>

            <AnimatePresence>
              {isCartModalOpen && (
                <CartModal 
                  closeModal={closeCartModal} 
                  openSuccessModal={openSuccessModal}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isSuccessModalOpen && <CheckoutSuccessModal closeModal={closeSuccessModal} />}
            </AnimatePresence>

            {/* Main Content Routes */}
            <main className={`flex-grow z-10 ${isAdminRoute ? '' : 'pt-20'}`}> 
              <AnimatePresence mode='wait'>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"></div>}>
                  <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<PageWrapper><LandingPage openModal={openAuthModal} /></PageWrapper>} />
                    <Route path="/store" element={<PageWrapper><StorePage /></PageWrapper>} />
                    <Route path="/store/all-products" element={<PageWrapper><AllProductsPage /></PageWrapper>} />
                    <Route path="/verify" element={<PageWrapper><VerifyPage /></PageWrapper>} />
                    <Route path="/product/:productId" element={<PageWrapper><ProductDetailPage /></PageWrapper>} />
                    <Route path="/my-orders" element={<PageWrapper><MyOrdersPage /></PageWrapper>} />
                    <Route path="/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<PageWrapper><AdminLogin /></PageWrapper>} />
                    <Route path="/admin/*" element={
                      <AdminRoute>
                        <PageWrapper>
                          <AdminDashboard />
                        </PageWrapper>
                      </AdminRoute>
                    } />
                  </Routes>
                </Suspense>
              </AnimatePresence>
            </main>

            {/* Footer */}
            {!isAdminRoute && <Footer />}
          </motion.div>
        )}
      </div>
    </MotionConfig>
  );
}

// Wrap AppContent with both AuthProviders
export default function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <AppContent />
      </AdminAuthProvider>
    </AuthProvider>
  );
}