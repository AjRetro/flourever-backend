import React, { useRef, useMemo } from 'react'; // Removed useState
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useScroll } from 'framer-motion';
import * as THREE from 'three';

// --- Individual Pastry Component ---
function Pastry({ initialPosition, color, fallSpeed, rotationSpeed }) {
  const meshRef = useRef();
  const { scrollYProgress } = useScroll();
  const { viewport } = useThree();

  // No longer needed: groundY, landing offsets, hasLanded state

  useFrame((state, delta) => {
    // 1. Calculate scroll progress (0 to 1)
    const progress = scrollYProgress.get();

    // --- NEW: Apply easing for acceleration ---
    // Using progress^1.5 makes it start slower and end faster.
    // You can experiment with higher exponents like progress ** 2 for more acceleration.
    const easedProgress = progress ** 4; 

    // 2. Calculate target Y based on eased progress and fall speed
    // Starts high (viewport.height * 1.5)
    // Ends low (well below the screen, e.g., -viewport.height * 1.5)
    const targetY = THREE.MathUtils.lerp(
      viewport.height * 1.5,      // Start position (well above screen)
      -viewport.height * 1.5,     // End position (well below screen)
      easedProgress * fallSpeed // Apply individual fall speed to eased progress
    );

    // 3. Apply the calculated Y position (No clamping needed)
    meshRef.current.position.y = targetY;

    // 4. Apply continuous rotation (No slowdown needed)
    meshRef.current.rotation.x += delta * rotationSpeed.x;
    meshRef.current.rotation.y += delta * rotationSpeed.y;
    meshRef.current.rotation.z += delta * rotationSpeed.z;

    // 5. Reset position if scrolled back to top (Optional but good for UX)
    // If scroll is near the top, reset the pastry high above
    if (progress < 0.01 && meshRef.current.position.y < viewport.height) {
         meshRef.current.position.y = viewport.height * (1.5 + Math.random() * 1); // Reset high
         // Reset rotation? Maybe not needed.
    }

    // Reset X and Z to initial positions (important if resetting Y)
    meshRef.current.position.x = initialPosition[0];
    meshRef.current.position.z = initialPosition[2];

  });

  return (
    <mesh ref={meshRef} position={initialPosition}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
    </mesh>
  );
}

// --- Main Falling Pastries Scene (Unchanged from previous version) ---
export default function FallingPastries() {
  const pastryCount = 20;
  const { viewport } = useThree();

  const pastries = useMemo(() => {
    const temp = [];
    const colors = ['#ae6f44', '#F5DAB1', '#654321', '#FFC0CB'];

    for (let i = 0; i < pastryCount; i++) {
      temp.push({
        initialPosition: [
          (Math.random() - 0.5) * viewport.width * 0.8,
          viewport.height * (1.5 + Math.random() * 2), // Start high
          (Math.random() - 0.5) * 5
        ],
        color: colors[Math.floor(Math.random() * colors.length)],
        fallSpeed: 0.8 + Math.random() * 0.4, // Keep individual speeds
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.5,
        }
      });
    }
    return temp;
  }, [pastryCount, viewport.width, viewport.height]);


  return (
    <>
      <ambientLight intensity={1.0} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} />

      {pastries.map((props, i) => (
        <Pastry key={i} {...props} />
      ))}
    </>
  );
}

