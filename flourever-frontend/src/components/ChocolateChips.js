import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// This component generates a random number in a range
const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

/**
 * Creates a "scattered chocolate chip" background effect.
 * @param {object} props
 * @param {number} props.count - The number of chips to scatter.
 */
function ChocolateChips({ count = 100 }) {
  
  // We use useMemo to create the random positions only once
  // so they don't change on every re-render.
  const chips = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      // Use our brand-accent color for the chips
      const color = '#835834'; 
      // Give each chip a random size (scale) and rotation
      const transform = `
        scale(${random(50, 150) / 100}) 
        rotate(${random(0, 360)}deg)
      `;
      
      return {
        id: i,
        style: {
          backgroundColor: color,
          // Scatter them randomly across the entire parent div
          top: `${random(-10, 110)}%`, // Y position (from -10% to 110%)
          left: `${random(-10, 110)}%`, // X position (from -10% to 110%)
          width: `${random(8, 20)}px`, // Random width
          height: `${random(8, 20)}px`, // Random height
          transform: transform,
        },
      };
    });
  }, [count]);

  return (
    // This container holds all the chips
    // It's absolute, behind everything (z-0), and ignores mouse clicks
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {chips.map((chip) => (
        <motion.div
          key={chip.id}
          className="absolute rounded-full" // All chips are circles
          style={chip.style}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }} // Make them semi-transparent
          transition={{
            duration: 1.5,
            delay: Math.random() * 2, // Stagger their fade-in
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}

export default ChocolateChips;
