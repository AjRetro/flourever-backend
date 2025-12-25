import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// --- NEW: CAKE ASSEMBLY ANIMATION ---
const CakeAssemblyAnimation = () => {
  // Variants for the different cake parts falling in
  const partVariants = {
    hidden: { y: -200, opacity: 0, scale: 0.5 },
    visible: (customDelay) => ({
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { 
        delay: customDelay,
        type: "spring", 
        damping: 12, 
        stiffness: 200 
      }
    })
  };

  return (
    <motion.svg
      width="200" // Increased size for better visibility
      height="200"
      viewBox="0 0 100 100"
      initial="hidden"
      animate="visible"
      className="mx-auto mb-6"
    >
      {/* 1. Plate (appears first) */}
      <motion.ellipse cx="50" cy="85" rx="40" ry="10" fill="#e0e0e0" 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      
      {/* 2. Bottom Layer (Brownie/Cake Base) */}
      <motion.path
        d="M20,75 Q50,85 80,75 L80,60 Q50,70 20,60 Z"
        fill="#654321" // Dark chocolate
        variants={partVariants}
        custom={0.5} // Delay start
      />
      <motion.ellipse cx="50" cy="60" rx="30" ry="8" fill="#8b5e3c" 
        variants={partVariants} custom={0.5} 
      />

      {/* 3. Middle Layer (Sponge) */}
      <motion.path
        d="M25,55 Q50,65 75,55 L75,40 Q50,50 25,40 Z"
        fill="#F5DAB1" // Sponge color
        variants={partVariants}
        custom={0.8} // Delay
      />
      <motion.ellipse cx="50" cy="40" rx="25" ry="6" fill="#ffe4b5" 
        variants={partVariants} custom={0.8} 
      />

      {/* 4. Top Layer (Frosting) */}
      <motion.path
        d="M30,35 Q50,45 70,35 L70,25 Q50,15 30,25 Z"
        fill="#fdf8f0" // White frosting
        variants={partVariants}
        custom={1.1} // Delay
      />
      {/* Drips of frosting */}
      <motion.path
        d="M30,30 Q35,40 40,30 Q45,38 50,30 Q55,42 60,30 Q65,38 70,30"
        stroke="#fdf8f0" strokeWidth="3" fill="none"
        variants={partVariants} custom={1.1}
      />

      {/* 5. Cherry on Top! */}
      <motion.circle cx="50" cy="20" r="5" fill="#e74c3c" 
        variants={partVariants}
        custom={1.4} // Final piece
      />
    </motion.svg>
  );
};


export default function CheckoutSuccessModal({ closeModal }) {
  const navigate = useNavigate();

  const handleViewOrders = () => {
    closeModal();
    navigate('/my-orders');
  };

  const handleContinue = () => {
    closeModal();
    // User stays on current page
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-brand-light w-full max-w-md rounded-3xl shadow-2xl p-8 md:p-12 text-center flex flex-col items-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
      >
        
        {/* --- The New Animation --- */}
        <CakeAssemblyAnimation />
        
        <motion.h2 
          className="text-3xl font-bold text-brand-primary font-serif mt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }} // Appears after cake is built
        >
          Order Placed!
        </motion.h2>
        
        <motion.p 
          className="text-lg text-brand-primary/80 mt-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.8 }}
        >
          We're baking your treats with love. They'll be on their way soon!
        </motion.p>

        {/* Buttons */}
        <motion.div 
          className="flex flex-col w-full gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.8 }}
        >
          <button
            onClick={handleViewOrders}
            className="w-full bg-brand-primary text-brand-light text-lg font-bold p-4 
                       rounded-full shadow-lg hover:bg-opacity-90 transition-transform active:scale-95"
          >
            Track My Order
          </button>
          <button
            onClick={handleContinue}
            className="w-full bg-transparent text-brand-primary/70 text-lg font-medium p-3 
                       hover:text-brand-primary transition-colors"
          >
            Continue Shopping
          </button>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}