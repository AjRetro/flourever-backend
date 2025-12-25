import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Displays an image that fades to a new one based on the activeIndex.
 * @param {object} props
 * @param {Array} props.faqData - The array of all FAQ items.
 * @param {number} props.activeIndex - The index of the currently open question.
 */
function FaqImage({ faqData, activeIndex }) {
  
  // Determine which image to show.
  // Use a 'defaultImage' from the first item if no item is selected.
  const currentImage = activeIndex === -1 
    ? (faqData[0]?.defaultImage || 'https://placehold.co/600x600/fdf8f0/ae6f44?text=Have+Questions%3F&font=serif') // Safeguard
    : faqData[activeIndex]?.imageSrc;
  
  const currentAlt = activeIndex === -1
    ? "FlourEver FAQ"
    : faqData[activeIndex]?.question;

  // Ensure we always have a valid image source to prevent crashes
  const safeImageSrc = currentImage || faqData[0]?.defaultImage || 'https://placehold.co/600x600/fdf8f0/ae6f44?text=Error&font=serif';

  return (
    // We'll make the image "sticky" so it stays in view
    // as you scroll through the accordion questions.
    <div className="w-full sticky top-28"> {/* top-28 gives space for the navbar */}
      <div className="relative w-full h-96 rounded-2xl shadow-xl overflow-hidden
                      border-4 border-brand-light">
        <AnimatePresence>
          <motion.img
            // By changing the key, we force Framer Motion to animate
            key={safeImageSrc} // Use the image src as the key
            src={safeImageSrc}
            alt={currentAlt}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}

export default FaqImage;

