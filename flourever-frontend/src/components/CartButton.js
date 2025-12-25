import React from 'react';
import { ShoppingBagIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function CartButton({ onClick }) {
  const { cart } = useAuth();

  // Calculate the total number of items
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <motion.button
      onClick={onClick}
      className="relative text-brand-primary p-2"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <ShoppingBagIcon className="w-7 h-7" />
      
      {/* Animated item count badge */}
      {itemCount > 0 && (
        <motion.div
          className="absolute -top-1 -right-2 bg-brand-accent text-white
                     text-xs font-bold w-5 h-5 rounded-full
                     flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          {itemCount}
        </motion.div>
      )}
    </motion.button>
  );
}