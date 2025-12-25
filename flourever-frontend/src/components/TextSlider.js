import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// We already have these icons installed from when we fixed the modal!
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

/**
 * A component that displays text slides with fade animations and navigation arrows.
 * @param {object} props
 * @param {Array<React.ReactNode>} props.slides - An array of JSX elements (e.g., <p> tags) to be used as slides.
 */
function TextSlider({ slides = [] }) {
  // useState holds the index of the currently visible slide
  const [index, setIndex] = useState(0);

  // This function safely moves to the next slide, looping to the start
  const nextSlide = () => {
    setIndex(prevIndex => (prevIndex + 1) % slides.length);
  };

  // This function safely moves to the previous slide, looping to the end
  const prevSlide = () => {
    setIndex(prevIndex => (prevIndex - 1 + slides.length) % slides.length);
  };

  // Animation variants for the text
  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  };

  return (
    <div className="flex items-center gap-2">
      {/* 1. Left Arrow Button */}
      <button
        onClick={prevSlide}
        // --- THIS IS THE FIX ---
        className="p-2 rounded-full bg-brand-secondary text-brand-primary shadow-md
                   transition-all hover:bg-brand-light hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>

      {/* 2. Text Content (with Animation) */}
      <div className="flex-1 h-48 overflow-hidden relative"> {/* Fixed height for smooth animation */}
        <AnimatePresence mode="wait">
          <motion.div
            // By changing the key, we tell AnimatePresence to animate the exit/entry
            key={index}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={slideVariants.transition}
            className="absolute w-full h-full"
          >
            {/* Display the current slide's content */}
            <div className="space-y-4 text-lg">
              {slides[index]}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. Right Arrow Button */}
      <button
        onClick={nextSlide}
        // --- THIS IS THE FIX ---
        className="p-2 rounded-full bg-brand-secondary text-brand-primary shadow-md
                   transition-all hover:bg-brand-light hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>
    </div>
  );
}

export default TextSlider;

