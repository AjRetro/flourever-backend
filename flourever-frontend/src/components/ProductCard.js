import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBagIcon, CheckIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <-- 1. IMPORT THE "BRAIN"

// --- This is our reusable, "modern" card component ---
export function ProductCard({ product }) {
  // --- 2. GET THE 'addToCart' FUNCTION ---
  const { addToCart } = useAuth();
  
  // --- 3. ADD STATE FOR "ADDED" ANIMATION ---
  const [isAdded, setIsAdded] = useState(false);

  // This effect resets the checkmark after 1.5s
  useEffect(() => {
    if (isAdded) {
      const timer = setTimeout(() => {
        setIsAdded(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAdded]);

  const handleAddToCart = (e) => {
    e.preventDefault(); // Stop the Link from navigating
    e.stopPropagation(); // Stop the click from bubbling
    addToCart(product, 1, 'Regular'); // Add 1 "Regular" size
    setIsAdded(true); // Trigger the checkmark animation
  };

  return (
    <motion.div
      layout
      className="group bg-brand-light rounded-2xl shadow-lg border border-brand-primary/10 overflow-hidden"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.03 }}
    >
      {/* --- 4. WRAP IMAGE IN A LINK --- */}
      {/* The image and text link to the detail page */}
      <Link to={`/product/${product.id}`}>
        <div className="w-full h-40 bg-brand-secondary rounded-t-lg overflow-hidden mb-4">
          <img 
            src={product.imageURL} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
            loading="lazy" 
          />
        </div>
        <div className="p-4 pt-0">
          <h3 className="text-lg font-serif font-medium text-brand-primary truncate">{product.name}</h3>
          <p className="text-sm text-brand-primary/70 mb-2 h-10">{product.description.substring(0, 40)}...</p>
        </div>
      </Link>
      
      {/* --- 5. UPDATED BUTTON --- */}
      <div className="p-4 pt-0">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-brand-accent">PHP {product.price}</span>
          
          <motion.button 
            onClick={handleAddToCart}
            className="bg-brand-primary text-brand-light p-2 rounded-full shadow-md
                      transition-all duration-300 ease-in-out
                      opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            {/* 6. ANIMATED ICON SWAP */}
            <AnimatePresence mode="wait">
              {isAdded ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                >
                  <CheckIcon className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="bag"
                  initial={{ scale: 0.5, opacity: 0, rotate: 90 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0, rotate: -90 }}
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}