import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Let's define our list of images here.
// We'll use our bakery-themed placeholders for now.
const images = [
  '/images/caro1.jpg',
  '/images/caro2.jpg',
  '/images/caro3.jpg',
  '/images/caro4.jpg',
];

function ImageCarousel() {
  // This state holds the index of the currently visible image
  const [index, setIndex] = useState(0);

  // This useEffect sets up a timer (an interval)
  useEffect(() => {
    // This function runs every 4 seconds
    const interval = setInterval(() => {
      // Increment the index, and loop back to 0 if we reach the end
      setIndex(prevIndex => (prevIndex + 1) % images.length);
    }, 4000); // 4000ms = 4 seconds

    // This is a cleanup function to stop the timer when the component is removed
    return () => clearInterval(interval);
  }, []); // The empty array [] means this effect runs only once

  return (
    // This div holds the carousel and clips the image to the rounded corners
    <div className="relative w-full h-64 md:h-80 rounded-lg shadow-lg overflow-hidden">
      {/* AnimatePresence is the magic part from Framer Motion */}
      {/* It allows the exiting image to animate out */}
      <AnimatePresence>
        <motion.img
          // By changing the key, we tell React to treat this as a NEW
          // component, which allows AnimatePresence to work.
          key={index} 
          src={images[index]}
          alt="Bakery slideshow"
          className="absolute inset-0 w-full h-full object-cover"
          
          // Animation properties
          initial={{ opacity: 0 }} // Start invisible
          animate={{ opacity: 1 }} // Fade in
          exit={{ opacity: 0 }} // Fade out
          transition={{ duration: 1.0, ease: 'easeInOut' }} // 1-second fade
        />
      </AnimatePresence>
    </div>
  );
}

export default ImageCarousel;
