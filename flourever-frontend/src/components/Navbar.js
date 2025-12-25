import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import { AnimatePresence, motion } from 'framer-motion';
import { UserIcon, ShoppingBagIcon } from '@heroicons/react/24/solid';

// --- CartButton Component ---
const CartButton = ({ onClick }) => {
  const { cart } = useAuth();
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <motion.button
      onClick={onClick}
      className="relative text-brand-primary p-2"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <ShoppingBagIcon className="w-7 h-7" />
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            className="absolute -top-1 -right-2 bg-brand-accent text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            {itemCount}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// --- Animated Hamburger Icon ---
const HamburgerIcon = ({ isOpen, onClick }) => {
  const topVariants = { closed: { rotate: 0, translateY: 0 }, open: { rotate: 45, translateY: 8 } };
  const middleVariants = { closed: { opacity: 1 }, open: { opacity: 0 } };
  const bottomVariants = { closed: { rotate: 0, translateY: 0 }, open: { rotate: -45, translateY: -8 } };

  return (
    <motion.button onClick={onClick} className="w-6 h-6 relative" animate={isOpen ? 'open' : 'closed'} initial={false}>
      <motion.span className="block h-0.5 w-full bg-brand-primary absolute" style={{ top: '4px' }} variants={topVariants} />
      <motion.span className="block h-0.5 w-full bg-brand-primary absolute" style={{ top: '12px' }} variants={middleVariants} />
      <motion.span className="block h-0.5 w-full bg-brand-primary absolute" style={{ top: '20px' }} variants={bottomVariants} />
    </motion.button>
  );
};

// --- Mobile Menu Dropdown Animation ---
const mobileMenuVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -20 },
};

// --- Links for Guests ---
const PublicLinks = ({ isMobile = false, openModal, setIsMobileMenuOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
    if (user) {
      navigate('/store');
    } else {
      openModal();
    }
    if (isMobile) setIsMobileMenuOpen(false);
  };

  return (
    <>
      <ScrollLink to="about" smooth={true} duration={500} offset={-80} className="nav-link" onClick={() => isMobile && setIsMobileMenuOpen(false)}>About</ScrollLink>
      <ScrollLink to="history" smooth={true} duration={500} offset={-80} className="nav-link" onClick={() => isMobile && setIsMobileMenuOpen(false)}>History</ScrollLink>
      <ScrollLink to="products" smooth={true} duration={500} offset={-80} className="nav-link" onClick={() => isMobile && setIsMobileMenuOpen(false)}>Products</ScrollLink>
      <ScrollLink to="media" smooth={true} duration={500} offset={-80} className="nav-link" onClick={() => isMobile && setIsMobileMenuOpen(false)}>Media</ScrollLink>
      <ScrollLink to="faq" smooth={true} duration={500} offset={-80} className="nav-link" onClick={() => isMobile && setIsMobileMenuOpen(false)}>FAQ</ScrollLink>
      <button onClick={handleGetStartedClick} className={isMobile ? "nav-link text-left text-brand-primary font-bold" : "bg-brand-primary text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition-all transform hover:scale-105"}>Get Started</button>
    </>
  );
};

// --- Links for Logged-In Users ---
const UserLinks = ({ isMobile = false, setIsMobileMenuOpen, openCartModal }) => {
  const { user, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [profileMenuRef]);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    if (isMobile) setIsMobileMenuOpen(false);
    logout();
  };

  // --- Mobile Links ---
  if (isMobile) {
    return (
      <>
        <span className="px-1 py-2 text-sm text-brand-primary/70">Welcome, {user.firstName}!</span>
        <RouterLink to="/store" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Store</RouterLink>
        
        {/* Menu Link */}
        <RouterLink to="/store/all-products" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Menu</RouterLink>
        
        <RouterLink to="/my-orders" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>My Orders</RouterLink>
        <RouterLink to="/profile" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>My Profile</RouterLink>
        
        {!!user.isAdmin && (
          <RouterLink to="/admin" className="nav-link bg-red-100 text-red-600 px-3 py-1 rounded-full" onClick={() => setIsMobileMenuOpen(false)}>Admin Panel</RouterLink>
        )}
        <button onClick={handleLogout} className="nav-link text-left text-red-600 font-medium">Logout</button>
        <div className="pt-2 border-t border-brand-primary/10">
          <button onClick={() => { setIsMobileMenuOpen(false); openCartModal(); }} className="nav-link flex items-center gap-2">
            <CartButton onClick={() => {}} /> 
            <span>My Cart</span>
          </button>
        </div>
      </>
    );
  }

  // --- Desktop Links ---
  return (
    <>
      <span className="text-gray-700 hidden lg:block">Welcome, {user.firstName}!</span>
      <RouterLink to="/store" className="nav-link">Store</RouterLink>
      
      {/* Menu Link */}
      <RouterLink to="/store/all-products" className="nav-link">Menu</RouterLink>
      
      <RouterLink to="/my-orders" className="nav-link">My Orders</RouterLink>
      
      {!!user.isAdmin && (
        <RouterLink to="/admin" className="nav-link bg-red-100 text-red-600 px-3 py-1 rounded-full">Admin Panel</RouterLink>
      )}

      <CartButton onClick={openCartModal} />

      {/* Profile Icon & Menu */}
      <div className="relative" ref={profileMenuRef}>
        <motion.button
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9, rotate: -5 }}
          className="w-10 h-10 rounded-full bg-brand-light border-2 border-brand-primary/30 text-brand-primary p-2 flex items-center justify-center shadow-sm"
        >
          <UserIcon className="w-6 h-6" />
        </motion.button>

        <AnimatePresence>
          {isProfileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="absolute right-0 top-14 w-48 bg-brand-light rounded-lg shadow-xl p-2 border border-brand-primary/10"
            >
              <RouterLink 
                to="/profile" 
                className="block w-full text-left px-4 py-2 text-sm text-brand-primary hover:bg-brand-secondary rounded-md"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                My Profile
              </RouterLink>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-brand-secondary rounded-md"
              >
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

// --- SHARED LOGO COMPONENT ---
// This ensures the logo looks exactly the same in all places
const LogoImage = () => (
  <img 
    src="/icons/navbaricon.png" 
    alt="FlourEver Bakery" 
    // We use h-12 for the container height but scale-[1.8] to visually zoom it in significantly
    // origin-left ensures it grows outward to the right without shifting
    // ADDED translate-y-1 to nudge it down
    className="h-12 w-auto object-contain origin-left scale-[1.8] hover:scale-[1.9] translate-y-2 transition-transform duration-200 block" 
  />
);

// --- LOGO LINK WRAPPER ---
const LogoLink = ({ onLandingPage }) => (
  onLandingPage ? (
    <ScrollLink 
      to="top" 
      smooth={true} 
      duration={500} 
      className="cursor-pointer block"
    >
      <LogoImage />
    </ScrollLink>
  ) : (
    <button 
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
      className="cursor-pointer block"
    >
      <LogoImage />
    </button>
  )
);

// --- Main Navbar Component ---
function Navbar({ openModal, openCartModal }) {
  const { user } = useAuth();
  const location = useLocation();
  const onLandingPage = location.pathname === '/';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  return (
    <>
      <nav className={`w-full fixed top-0 z-40 transition-colors duration-300 ${isScrolled ? 'bg-brand-secondary shadow-md' : 'bg-transparent'}`}>
        <div className="w-full container mx-auto px-6 py-3 flex justify-between items-center">
          
          {/* Logo Section */}
          <LogoLink onLandingPage={onLandingPage} />
          
          <div className="hidden md:flex items-center space-x-6">
            {onLandingPage ? (
              <PublicLinks isMobile={false} openModal={openModal} setIsMobileMenuOpen={setIsMobileMenuOpen} />
            ) : user ? (
              <UserLinks isMobile={false} setIsMobileMenuOpen={setIsMobileMenuOpen} openCartModal={openCartModal} />
            ) : (
              <PublicLinks isMobile={false} openModal={openModal} setIsMobileMenuOpen={setIsMobileMenuOpen} />
            )}
          </div>
          <div className="md:hidden flex items-center">
            <HamburgerIcon isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              className={`md:hidden absolute w-full flex flex-col space-y-4 p-6 ${isScrolled ? 'bg-brand-secondary' : 'bg-brand-secondary/90 backdrop-blur-sm'}`}
              style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              variants={mobileMenuVariants} initial="hidden" animate="visible" exit="exit"
            >
              {onLandingPage ? (
                <PublicLinks isMobile={true} openModal={openModal} setIsMobileMenuOpen={setIsMobileMenuOpen} />
              ) : user ? (
                <UserLinks isMobile={true} setIsMobileMenuOpen={setIsMobileMenuOpen} openCartModal={openCartModal} />
              ) : (
                <PublicLinks isMobile={true} openModal={openModal} setIsMobileMenuOpen={setIsMobileMenuOpen} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <style>{`
        .nav-link {
          color: #ae6f44;
          font-weight: 500;
          transition: color 0.2s;
          cursor: pointer;
          display: block;
          padding: 0.5rem 0;
        }
        .nav-link:hover { color: #835834; }
        @media (min-width: 768px) {
          .nav-link { display: inline-block; padding: 0; }
        }
      `}</style>
    </>
  );
}

export default Navbar;