import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber'; // Import useThree
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// --- Sprinkles Component Removed --- 

// --- Main Donut Model Component ---
function Model() {
  const group = useRef();
  // Get viewport and pointer (mouse) data from useThree hook
  const { viewport, pointer } = useThree();

  useFrame((state, delta) => {
    // --- MOUSE FOLLOW LOGIC ---
    // 1. Calculate target rotation based on mouse position
    // Map mouse X (-1 to 1) to Y rotation (e.g., -PI/4 to PI/4)
    const targetRotationY = (pointer.x * Math.PI) / 4; 
    // Map mouse Y (-1 to 1) to X rotation (e.g., -PI/8 to PI/8)
    const targetRotationX = (pointer.y * Math.PI) / 8;

    // 2. Smoothly interpolate (lerp) current rotation towards target rotation
    // group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotationY, 0.1); 
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRotationX, 0.1);
    
    // Combine mouse follow with the slow base rotation
     group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotationY + state.clock.elapsedTime * 0.3, 0.1);


    // Keep the slow base rotation (commented out if you only want mouse follow)
    // group.current.rotation.y += delta * 0.3; 
  });

  return (
    <motion.group
      ref={group}
      dispose={null}
      scale={1.2} // Keep existing scale and animation
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1.2, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5, type: 'spring' }}
    >
      {/* --- 1. The Dough Base --- */}
      <mesh>
        <torusGeometry args={[0.8, 0.3, 32, 100]} />
        <meshStandardMaterial color="#EDD272" roughness={0.7} />
      </mesh>

      {/* --- 2. The Chocolate Glaze --- */}
      <mesh
        name="chocolateGlaze" 
        position={[0, 0, 0.18]} // Your forward position
        rotation={[0, 0, 0]}   // Your flat rotation
      >
        <torusGeometry
          args={[
            0.8, // Your glaze radius
            0.29, // Your glaze tube thickness
            32,
            100
          ]}
        />
        <meshStandardMaterial color="#ae6f44" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* --- 3. Sprinkles Removed --- */}

    </motion.group>
  );
}

// --- Main Canvas Export (Unchanged) ---
export default function Donut() {
  return (
    <Canvas
      camera={{ position: [0, 2.5, 5], fov: 45 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 10, 7.5]} intensity={2} />
      <Model />
      {/* We keep OrbitControls, it will take over when the user drags */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        maxPolarAngle={Math.PI / 2} 
        minPolarAngle={Math.PI / 3} 
      />
    </Canvas>
  );
}

