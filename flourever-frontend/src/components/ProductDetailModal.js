import React, { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import Loader from './Loader'; // We can reuse our loader!

// --- 2. MADE THE MODEL BIGGER ---
function ModalModel({ gltfPath }) {
  const { scene } = useGLTF(gltfPath);
  // --- THIS IS THE BUG FIX ---
  // We MUST clone the scene, otherwise it gets "stolen" from the carousel
  return <primitive object={scene.clone()} scale={3} />;
}

export default function ProductDetailModal({ product, closeModal }) {
  if (!product) return null;

  return (
    // This is the backdrop (the blurred background)
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* This is the modal card itself */}
      <motion.div
        className="bg-brand-light w-full max-w-4xl h-[70vh] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 150 }}
      >
        {/* --- 4. "X" BUTTON IS NOW VISIBLE --- */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-brand-primary/50 hover:text-brand-primary z-50 p-1 bg-white/50 rounded-full"
        >
          <XMarkIcon className="w-8 h-8" />
        </button>

        {/* --- 1. 3D Model Column --- */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full bg-brand-secondary/50">
          <Canvas camera={{ position: [0, 0, 3], fov: 50 }} shadows>
            <Suspense fallback={<Loader />}>
              <ambientLight intensity={1} />
              <directionalLight
                position={[5, 5, 5]}
                intensity={1.5}
                castShadow
              />
              <ModalModel gltfPath={product.gltfPath} />
              <OrbitControls
                enableZoom={true} // <-- 5. ZOOM IS ENABLED
                enablePan={false}
                autoRotate={true} // Add a slow auto-rotate
                autoRotateSpeed={1.0}
                maxPolarAngle={Math.PI / 2}
                minPolarAngle={Math.PI / 2}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* --- 2. Description Column --- */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full p-8 flex flex-col justify-center overflow-y-auto">
          <h2 className="text-4xl font-bold text-brand-primary font-serif mb-4">
            {product.name}
          </h2>
          <p className="text-lg text-brand-primary opacity-80 mb-6">
            {product.description}
          </p>
          <p className="text-2xl font-bold text-brand-accent mb-6">
            Category
          </p>
          {/* --- 6. "ADD TO CART" BUTTON REMOVED --- */}
        </div>
      </motion.div>
    </motion.div>
  );
}

