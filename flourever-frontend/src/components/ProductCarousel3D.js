import React, { useRef, useState, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from './Loader';

// --- ModelLoader Component (Unchanged) ---
function ModelLoader({ gltfPath }) {
  const { scene } = useGLTF(gltfPath);
  const box = useMemo(() => new THREE.Box3().setFromObject(scene), [scene]);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = 1.3 / Math.max(size.x, size.y, size.z);
  return (
    // --- THIS IS THE BUG FIX ---
    // We MUST clone the scene here, so the carousel has its own copy
    <primitive
      object={scene.clone()} 
      scale={scale}
      position={[-center.x * scale, -center.y * scale + 0.1, -center.z * scale]}
      castShadow
    />
  );
}


// --- Individual 3D Product Item (Unchanged) ---
function Item({ product, index, totalItems, onHover, isHovered, onProductClick }) {
  const groupRef = useRef();
  const spacing = 4.5;
  const totalWidth = (totalItems - 1) * spacing;
  const initialX = index * spacing - totalWidth / 2;

  useFrame((state, delta) => {
    groupRef.current.rotation.y += delta * (isHovered ? 0.05 : 0.2);
    groupRef.current.position.y = isHovered ? 0.1 : 0;
    groupRef.current.position.x = initialX;
  });

  return (
    <group
      ref={groupRef}
      position={[initialX, 0, 0]}
      // Pass events up to the parent
      onPointerOver={(e) => { e.stopPropagation(); onHover(index); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { onHover(null); document.body.style.cursor = 'grab'; }}
    >
      
      {/* --- Invisible Hitbox --- */}
      <mesh
        onClick={(e) => {
          e.stopPropagation(); // Stop the click
          onProductClick(product); // Fire the event
        }}
      >
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* --- Visible Content --- */}
      <Suspense fallback={null}>
        <ModelLoader gltfPath={product.gltfPath} />
      </Suspense>
      <Text
        position={[0, -1.2, 0]}
        fontSize={0.3}
        color="#ae6f44"
        anchorX="center"
        anchorY="middle"
      >
        {product.name}
      </Text>

      {/* Tooltip (Unchanged) */}
      <AnimatePresence>
        {isHovered && (
          <Html
            position={[0, 1.5, 0]} 
            center
            distanceFactor={10}
            zIndexRange={[100, 0]}
            style={{ pointerEvents: 'none' }} 
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="p-1 bg-brand-primary rounded-xl shadow-2xl"
            >
              <div className="p-0.5 bg-brand-secondary rounded-lg">
                <div className="w-56 bg-white rounded-md p-5 pt-12 relative">
                  <img
                    src={product.iconPath}
                    alt={product.name}
                    className="w-20 h-20 absolute -top-10 left-1/2 -translate-x-1/2
                               transform -rotate-12"
                  />
                  <p className="text-center text-base text-brand-primary opacity-90 font-medium">
                    {product.name}
                  </p>
                  <p className="text-center text-sm text-brand-primary opacity-70 mt-1">
                    {product.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </Html>
        )}
      </AnimatePresence>
    </group>
  );
}

// --- Helper Component (Unchanged) ---
function ControlsManager({ controlsRef, hoveredIndex, setIsDragging }) {
  
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const onDragStart = () => {
      setIsDragging(true);
    };
    const onDragEnd = () => {
      setIsDragging(false);
    };

    controls.addEventListener('start', onDragStart);
    controls.addEventListener('end', onDragEnd);

    return () => {
      controls.removeEventListener('start', onDragStart);
      controls.removeEventListener('end', onDragEnd);
    };
  }, [controlsRef, setIsDragging]);

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = hoveredIndex === null;
    }
  });
  return null;
}


// --- Main 3D Carousel Component ---
export default function ProductCarousel3D({ products = [], onProductClick }) {
  const controlsRef = useRef();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleHover = (index) => {
    if (isDragging) return; 
    setHoveredIndex(index);
  };

  return (
    <div className="w-full h-[400px] md:h-[500px] cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 1, 10], fov: 50 }}
        shadows
        onPointerLeave={() => { 
          document.body.style.cursor = 'grab'; 
          setHoveredIndex(null);
        }}
      >
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={0.8} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.5}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <pointLight position={[-5, 5, -5]} intensity={0.4} />

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <shadowMaterial opacity={0.3} />
          </mesh>

          <group position={[0, 0, 0]}>
            {products.map((product, index) => (
              <Item
                key={product.id}
                product={product}
                index={index}
                totalItems={products.length}
                onHover={handleHover}
                isHovered={hoveredIndex === index}
                onProductClick={onProductClick} // <-- Pass prop down
              />
            ))}
          </group>

          <OrbitControls
            ref={controlsRef}
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            minPolarAngle={Math.PI / 2.5}
            maxPolarAngle={Math.PI / 1.8}
          />
          
          <ControlsManager 
            controlsRef={controlsRef} 
            hoveredIndex={hoveredIndex} 
            setIsDragging={setIsDragging}
          />

        </Suspense>
      </Canvas>
    </div>
  );
}

