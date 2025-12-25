import React from 'react';
import { motion } from 'framer-motion';

function WaveDivider() {
  // We create a wave path that is twice as wide as the screen (200%)
  // By animating it from x=0 to x=-100%, it creates a perfect, seamless loop.
  const waveVariants = {
    animate: {
      x: ['0%', '-50%'], // Move from start to middle
      transition: {
        x: {
          repeat: Infinity,
          repeatType: 'loop',
          duration: 10, // Adjust speed (longer duration = slower)
          ease: 'linear',
        },
      },
    },
  };

  return (
    <div className="w-full overflow-hidden">
      {/* This motion.svg is 200% wide and contains two copies of the wave,
        allowing it to loop seamlessly.
      */}
      <motion.svg
        width="200%"
        height="100" // Adjust height as needed
        viewBox="0 0 2000 100" // Viewbox is 2x width of the final wave
        preserveAspectRatio="none"
        variants={waveVariants}
        animate="animate"
        className="block"
      >
        {/* We use our 'brand-primary' color from Tailwind */}
        <path
          d="
            M 0,50 
            C 250,100 250,0 500,50 
            S 750,100 1000,50 
            S 1250,0 1500,50
            S 1750,100 2000,50
            V 100 H 0 Z
          "
          fill="#ae6f44" // Fill with brand-primary color
        />
      </motion.svg>
    </div>
  );
}

export default WaveDivider;
