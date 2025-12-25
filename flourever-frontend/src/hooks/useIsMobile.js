import { useState, useEffect } from 'react';

/**
 * A custom hook to check if the user is on a mobile-sized screen.
 * @returns {boolean} True if the screen width is less than 768px.
 */
export function useIsMobile() {
  // We check for 768px, which is Tailwind's 'md' breakpoint
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up event listener on unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures this runs only on mount and unmount

  return isMobile;
}
