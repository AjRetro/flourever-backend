import React from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import cakeAnim from '../assets/cake-loader.json'; // Make sure path is correct

const GlobalLoader = () => {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-brand-secondary"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* The Animation */}
      <div className="w-32 h-32 md:w-48 md:h-48">
        <Lottie animationData={cakeAnim} loop={true} />
      </div>

      {/* Loading Text */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="mt-4 text-brand-primary font-serif text-xl font-bold tracking-widest"
      >
        BAKING...
      </motion.p>
    </motion.div>
  );
};

export default GlobalLoader;