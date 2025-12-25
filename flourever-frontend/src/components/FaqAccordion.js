import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/solid';

// --- 1. "CLEANER" ANIMATION ---
// We've removed the 'scale' properties to create a pure slide-down/slide-up effect.
const panelVariants = {
  hidden: {
    opacity: 0,
    y: -20, // Start 20px up
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  visible: {
    opacity: 1,
    y: 0, // End at its normal position
    transition: { type: 'spring', damping: 20, stiffness: 150 }
  }
};

// --- This component is a single Q&A item ---
function AccordionItem({ item, isOpen, onClick }) {
  return (
    // We only need relative, no z-index here
    <div className="w-full relative"> 
      {/* Question Button (Unchanged) */}
      <motion.button
        onClick={onClick}
        // --- 2. Z-INDEX FIX ---
        // Give the button a z-index of 20. It just needs to be clickable.
        className="flex justify-between items-center w-full p-5 bg-brand-primary text-brand-light rounded-lg shadow-md relative z-20"
        whileHover={{ scale: 1.02 }}
      >
        <span className="text-lg font-medium text-left">{item.question}</span>
        {/* Animated Plus/Minus Icon */}
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <PlusIcon className="w-6 h-6" />
        </motion.div>
      </motion.button>

      {/* Answer Panel (Animated) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="answer-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            // --- 2. Z-INDEX FIX ---
            // Give the answer panel the HIGHEST z-index (e.g., z-50)
            // This will make it "float" on top of everything else,
            // including the buttons below it.
            className="text-left text-brand-primary/80 absolute w-full z-50 mt-2"
          >
            <div className="p-5 bg-brand-light rounded-lg shadow-lg">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Main Accordion Component (Unchanged) ---
export default function FaqAccordion({ faqData, activeIndex, onQuestionClick }) {
  
  const handleClick = (index) => {
    onQuestionClick(index === activeIndex ? -1 : index);
  };

  return (
    // We can remove the z-index from this container
    <div className="w-full max-w-3xl mx-auto space-y-4 relative">
      {faqData.map((item, index) => (
        <AccordionItem
          key={index}
          item={item}
          isOpen={index === activeIndex}
          onClick={() => handleClick(index)}
        />
      ))}
    </div>
  );
}

