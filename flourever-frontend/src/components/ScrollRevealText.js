import React from 'react';
import { motion } from 'framer-motion';

// 1. Define the animation for the container (the whole paragraph)
const containerVariants = {
  // The 'visible' state will trigger the animation
  visible: {
    opacity: 1,
    transition: {
      // This tells Framer Motion to animate the children one by one
      staggerChildren: 0.03, // The delay between each word
    },
  },
  // The 'hidden' state is the starting point
  hidden: {
    opacity: 0,
  },
};

// 2. Define the animation for each individual word
const wordVariants = {
  // The 'visible' state (end point)
  visible: {
    opacity: 1,
    filter: 'blur(0px)', // End with no blur
    y: 0, // End at original position
    transition: { type: 'spring', damping: 15, stiffness: 100 },
  },
  // The 'hidden' state (starting point)
  hidden: {
    opacity: 0.1, // 'baseOpacity: 0.1'
    filter: 'blur(4px)', // 'blurStrength: 4'
    y: 20, // Start 20px lower
  },
};

/**
 * A component that reveals text word-by-word as it's scrolled into view.
 * @param {object} props
 * @param {string} props.children - The text string to animate.
 * @param {string} props.className - Tailwind classes to apply to the paragraph.
 */
function ScrollRevealText({ children, className = '' }) {
  // We only animate if 'children' is a string
  if (typeof children !== 'string') {
    return <p className={className}>{children}</p>;
  }

  // Split the text string into an array of words
  const words = children.split(' ');

  return (
    // This is the main container that triggers the animation
    <motion.p
      className={className} // Apply any passed-in Tailwind classes
      variants={containerVariants}
      initial="hidden"
      whileInView="visible" // This is the magic! Triggers when it enters the viewport
      viewport={{ once: true, amount: 0.2 }} // Trigger once, when 20% is visible
    >
      {/* We map over the array of words */}
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={wordVariants}
          style={{ display: 'inline-block', marginRight: '0.25em' }} // Add a space
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
}

export default ScrollRevealText;

