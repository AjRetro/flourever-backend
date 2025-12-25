import React from 'react';

/**
 * A gradient that only covers the top section and doesn't follow scroll
 */
function BackgroundGradient() {
  return (
    <div 
      className="absolute top-0 left-0 w-full z-[-20] pointer-events-none" 
      aria-hidden="true"
      style={{
        height: '50vh', // Only covers top half of viewport
        background: 'radial-gradient(ellipse at top left, rgba(174, 111, 68, 0.5) 0%, rgba(255, 228, 181, 0) 70%)',
        filter: 'blur(64px)',
        opacity: 1.5,
      }}
    />
  );
}

export default BackgroundGradient;