import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- This is the "Check Animation" component ---
const Checkmark = () => (
  <motion.svg
    width="100"
    height="100"
    viewBox="0 0 100 100"
    initial="hidden"
    animate="visible"
  >
    {/* The circle */}
    <motion.circle
      cx="50"
      cy="50"
      r="45"
      stroke="#ae6f44" // brand-primary
      strokeWidth="10"
      fill="transparent"
      initial={{ strokeDashoffset: 315, opacity: 0 }}
      animate={{ strokeDashoffset: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    />
    {/* The checkmark path */}
    <motion.path
      d="M 30 50 L 45 65 L 70 35"
      stroke="#ae6f44"
      strokeWidth="10"
      fill="transparent"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.8 }}
    />
  </motion.svg>
);

// --- This is the "Verifying" Spinner ---
const Spinner = () => (
  <motion.div
    className="w-24 h-24 border-8 border-brand-primary/20 border-t-brand-primary rounded-full"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
  />
);

export default function VerifyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // 'verifying' or 'verified'
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    // 1. This is a "guard." If no one is logged in, send them home.
    if (!user) {
      navigate('/');
      return; // Stop the timers from running
    }

    // 2. Start the "fake" verification timer
    const verificationTimer = setTimeout(() => {
      setStatus('verified');
    }, 3000); // Wait 3 seconds

    // 3. Start the redirect timer (for after the checkmark animation)
    const redirectTimer = setTimeout(() => {
      navigate('/store');
    }, 5500); // 3s (verify) + 2.5s (show checkmark) = 5.5s

    // 4. Clean up the timers if the user leaves the page
    return () => {
      clearTimeout(verificationTimer);
      clearTimeout(redirectTimer);
    };
  }, [user, navigate]);

  return (
    // This is a full-screen container
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-brand-primary text-center px-6">
      <AnimatePresence mode="wait">
        {status === 'verifying' && (
          <motion.div
            key="verifying"
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center"
          >
            <Spinner />
            <h1 className="text-3xl font-serif font-bold mt-6">
              Verifying your account...
            </h1>
            <p className="text-lg opacity-80 mt-2">
              We're just checking a few things. Please wait a moment.
            </p>
          </motion.div>
        )}

        {status === 'verified' && (
          <motion.div
            key="verified"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <Checkmark />
            <h1 className="text-3xl font-serif font-bold mt-6">
              Account Verified!
            </h1>
            <p className="text-lg opacity-80 mt-2">
              Welcome, {user?.firstName}! Redirecting you to the store...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}