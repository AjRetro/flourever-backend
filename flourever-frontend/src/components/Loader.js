import React from 'react';
import { useProgress, Html } from '@react-three/drei';

// This component will be shown by Suspense while assets are loading
function Loader() {
  const { progress } = useProgress(); // Get loading progress (0-100)

  return (
    // Html allows us to render regular HTML elements inside the 3D Canvas
    <Html center> 
      <div className="flex flex-col items-center text-brand-primary">
        <div className="w-16 h-16 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-sm font-medium">{Math.round(progress)}% loaded</p>
      </div>
    </Html>
  );
}

export default Loader;
