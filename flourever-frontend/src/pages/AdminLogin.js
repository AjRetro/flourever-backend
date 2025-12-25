import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // State to trigger the animation
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(username, password);
    
    if (result.success) {
      setIsLoading(false);
      setIsSuccess(true); // Trigger animation

      // 2.5 Second delay to let animation play before navigating
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 2500);
    } else {
      setIsLoading(false);
      setError(result.error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-secondary to-brand-light py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/10 rounded-full blur-xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-accent/10 rounded-full blur-xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 100, duration: 0.8 }}
        className="max-w-md w-full space-y-8 z-10"
      >
        {/* AnimatePresence handles the switch between Form and Success Animation */}
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            /* ================== ORIGINAL FORM ================== */
            <motion.div
              key="login-form"
              exit={{ opacity: 0, y: -20, filter: "blur(5px)" }}
              transition={{ duration: 0.3 }}
            >
              {/* Header Section */}
              <motion.div className="text-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mx-auto w-20 h-20 bg-gradient-to-br from-brand-accent to-brand-primary rounded-2xl flex items-center justify-center shadow-lg mb-6"
                >
                  <span className="text-white font-bold text-2xl">FE</span>
                </motion.div>
                
                <h2 className="text-4xl font-bold font-serif text-brand-primary">
                  FlourEver Admin
                </h2>
                <p className="mt-3 text-lg text-brand-primary/80">
                  Secure Bakery Management Portal
                </p>
              </motion.div>

              {/* Login Form */}
              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center shadow-sm">
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  </div>
                )}
                
                <div className="space-y-5">
                  {/* Username Field */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-brand-primary/80 mb-2">
                      Admin Username
                    </label>
                    <div className="relative">
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        className="relative block w-full px-4 py-4 bg-white border border-brand-primary/20 placeholder-brand-primary/40 text-brand-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all duration-300 shadow-sm text-base"
                        placeholder="Enter admin username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isLoading}
                        style={{ fontSize: '16px' }}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg className="h-5 w-5 text-brand-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-brand-primary/80 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        className="relative block w-full px-4 py-4 bg-white border border-brand-primary/20 placeholder-brand-primary/40 text-brand-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all duration-300 shadow-sm pr-12 text-base"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        style={{ fontSize: '16px' }}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-primary/40 hover:text-brand-accent transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: isLoading ? 1 : 1.02, boxShadow: "0 10px 25px -5px rgba(131, 88, 52, 0.4)" }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-brand-accent to-brand-primary hover:from-brand-primary hover:to-brand-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-3"
                      />
                      Authenticating...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Access Dashboard
                    </div>
                  )}
                </motion.button>

                {/* Back to Store Link */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="text-brand-primary/70 hover:text-brand-primary transition-colors duration-300 flex items-center justify-center space-x-2 mx-auto"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Return to Store</span>
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            /* ================== SUCCESS ANIMATION ================== */
            <motion.div
              key="success-view"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "backOut" }}
              className="flex flex-col items-center justify-center py-12 pt-16 space-y-8 bg-white/10 backdrop-blur-sm rounded-3xl p-8"
            >
               {/* The Lock Animation */}
               <div className="relative">
                 {/* Green Glow Background - Now fades in after unlock */}
                 <motion.div
                   className="absolute inset-0 rounded-full blur-xl"
                   initial={{ opacity: 0, backgroundColor: "rgba(16, 185, 129, 0.0)" }} // Start completely transparent
                   animate={{ 
                     opacity: [0, 1, 1], // Fade in
                     backgroundColor: ["rgba(16, 185, 129, 0.2)", "rgba(16, 185, 129, 0.5)", "rgba(16, 185, 129, 0.2)"] 
                   }}
                   transition={{ 
                     delay: 0.2, // Start fade-in after shackle lift and color change
                     duration: 2,
                     repeat: Infinity, 
                     repeatType: "reverse",
                     ease: "easeInOut"
                   }}
                 />
                 
                 {/* SVG has overflow-visible to prevent clipping when the mantle moves up */}
                 <svg 
                   className="w-32 h-32 text-brand-primary overflow-visible" 
                   viewBox="0 0 24 24" 
                   fill="none" 
                   stroke="currentColor" 
                   strokeWidth="2"
                 >
                    {/* Lock Shackle (Top) */}
                    <motion.path 
                      d="M7 11V7a5 5 0 0 1 10 0v4" 
                      initial={{ pathLength: 1, y: 0 }}
                      animate={{ y: -10 }}
                      transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
                      strokeLinecap="round"
                    />
                    
                    {/* Lock Body (Bottom) - Solid brown to Green */}
                    <motion.path 
                      d="M5 11h14v10H5z"
                      initial={{ fill: "#835834", stroke: "#835834" }} 
                      animate={{ fill: "#10B981", stroke: "#10B981" }} 
                      transition={{ delay: 0.6, duration: 0.5 }}
                    />
                    
                    {/* Keyhole */}
                    <motion.path 
                      d="M12 16v-2"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      transition={{ delay: 0.4 }}
                      strokeLinecap="round"
                    />
                 </svg>
              </div>

              <div className="text-center space-y-2">
                <motion.h3 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-3xl font-bold text-brand-primary"
                >
                  Access Granted
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="text-brand-primary/80"
                >
                  Entering Secure Portal...
                </motion.p>
              </div>

              {/* Progress Bar */}
              <motion.div 
                className="w-full max-w-[200px] h-1 bg-brand-primary/10 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <motion.div 
                  className="h-full bg-green-500"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1.2, duration: 1.3, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Demo Credentials (Only show when not success) */}
        {!isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-xl text-center"
          >
            <p className="text-xs text-brand-primary/60">
              <strong>Demo Credentials</strong><br />
              Username: <code className="bg-white px-1 rounded">flourever_admin</code><br />
              Password: <code className="bg-white px-1 rounded">BakeryMaster2024!</code>
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminLogin;