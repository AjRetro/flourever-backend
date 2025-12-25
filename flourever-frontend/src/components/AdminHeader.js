import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminHeader = ({ onMenuClick, onLogout }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Intercept the logout action
  const handleLogoutClick = () => {
    setIsProfileOpen(false); // Close dropdown
    setIsLoggingOut(true);   // Trigger animation overlay

    // Wait for animation (2 seconds) then actually log out
    setTimeout(() => {
      onLogout();
    }, 2000);
  };

  return (
    <>
      {/* ==================== HEADER CONTENT ==================== */}
      <header className="bg-white border-b border-brand-primary/10 sticky top-0 z-30">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left side - Menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-brand-secondary transition-colors"
          >
            <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Right side - Admin controls */}
          <div className="flex items-center space-x-4 ml-auto">
            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-brand-secondary transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-brand-accent to-brand-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-brand-primary">Admin</p>
                  <p className="text-xs text-brand-primary/70">flourever_admin</p>
                </div>
                <svg 
                  className={`w-4 h-4 text-brand-primary transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-brand-primary/10 py-1 z-40"
                  >
                    <div className="px-4 py-2 border-b border-brand-primary/5">
                      <p className="text-sm font-medium text-brand-primary">Admin User</p>
                      <p className="text-xs text-brand-primary/70 truncate">flourever_admin@flourever.com</p>
                    </div>
                    
                    <button
                      onClick={handleLogoutClick} // Use our interceptor handler
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Close dropdown when clicking outside */}
        {isProfileOpen && (
          <div
            className="fixed inset-0 z-30 lg:hidden"
            onClick={() => setIsProfileOpen(false)}
          />
        )}
      </header>

      {/* ==================== LOGOUT ANIMATION OVERLAY ==================== */}
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-brand-secondary to-brand-light backdrop-blur-md"
          >
             {/* Animated Background Elements (Similar to Login) */}
             <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/10 rounded-full blur-xl"
                />
             </div>

            <div className="relative z-10 flex flex-col items-center space-y-6">
              {/* The Lock Icon */}
              <div className="relative">
                {/* Green Glow fading OUT */}
                <motion.div
                   className="absolute inset-0 rounded-full blur-xl"
                   initial={{ opacity: 1, backgroundColor: "rgba(16, 185, 129, 0.3)" }}
                   animate={{ opacity: 0 }}
                   transition={{ duration: 0.5 }}
                 />

                <svg 
                  className="w-32 h-32 text-brand-primary overflow-visible" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                   {/* Lock Shackle - Starts UP (Open), Moves DOWN (Closed) */}
                   <motion.path 
                     d="M7 11V7a5 5 0 0 1 10 0v4" 
                     initial={{ y: -10 }} // Started Open
                     animate={{ y: 0 }}   // Closes
                     transition={{ delay: 0.4, duration: 0.5, type: "spring", bounce: 0.3 }}
                     strokeLinecap="round"
                   />
                   
                   {/* Lock Body - Starts Green (Unlocked), Turns Brown (Locked) */}
                   <motion.path 
                     d="M5 11h14v10H5z"
                     initial={{ fill: "#10B981", stroke: "#10B981" }} // Green
                     animate={{ fill: "#835834", stroke: "#835834" }} // Back to Brown
                     transition={{ delay: 0.6, duration: 0.5 }}
                   />
                   
                   {/* Keyhole - Fades IN */}
                   <motion.path 
                     d="M12 16v-2"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: 0.8 }}
                     strokeLinecap="round"
                   />
                </svg>
              </div>

              <div className="text-center">
                <motion.h3 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-brand-primary"
                >
                  Securing Portal
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-brand-primary/70 mt-2"
                >
                  Saving session and locking...
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminHeader;