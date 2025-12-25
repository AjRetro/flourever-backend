import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LogoutAnimation({ isLoggingOut }) {
  return (
    <AnimatePresence>
      {isLoggingOut && (
        <div className="fixed inset-0 z-[9999] flex pointer-events-auto">
          
          {/* Left Shutter */}
          <motion.div
            className="h-full bg-brand-primary shadow-2xl"
            initial={{ width: '0%' }}
            animate={{ width: '50%' }}
            exit={{ width: '0%' }}
            transition={{ type: 'spring', stiffness: 100, damping: 20, duration: 0.8 }}
          />

          {/* Right Shutter */}
          <motion.div
            className="h-full bg-brand-primary shadow-2xl"
            initial={{ width: '0%' }}
            animate={{ width: '50%' }}
            exit={{ width: '0%' }}
            transition={{ type: 'spring', stiffness: 100, damping: 20, duration: 0.8 }}
          />

          {/* Center Message - appears after shutters start moving */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-light">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">🤗</div>
              <h2 className="text-4xl font-serif font-bold">See you next time!</h2>
              <p className="text-xl opacity-80 mt-2">Closing up shop...</p>
            </motion.div>
          </div>

        </div>
      )}
    </AnimatePresence>
  );
}