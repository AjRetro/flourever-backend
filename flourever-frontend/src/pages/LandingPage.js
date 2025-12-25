import React, { Suspense, useRef, lazy, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useGLTF } from '@react-three/drei';
import Donut from '../components/Donut';
import MediaStack from '../components/MediaStack';
import ScrollRevealText from '../components/ScrollRevealText';
import RotatingText from '../components/RotatingText';
import WaveDivider from '../components/WaveDivider';
import ChocolateChips from '../components/ChocolateChips';
import ImageCarousel from '../components/ImageCarousel';
import TextSlider from '../components/TextSlider';
import FaqAccordion from '../components/FaqAccordion';
import FaqImage from '../components/FaqImage';
import { useIsMobile } from '../hooks/useIsMobile';
import ProductDetailModal from '../components/ProductDetailModal';
// --- 1. IMPORT FallingPastries and Canvas ---
import FallingPastries from '../components/FallingPastries';
import { Canvas } from '@react-three/fiber';

// --- PLACEHOLDER & LAZY-LOAD DEFINITIONS ---
const LazyProductCarousel = lazy(() => import('../components/ProductCarousel3D'));

// ... (CarouselPlaceholder, DonutLoadingFallback remain the same) ...
const CarouselPlaceholder = () => (
  <div className="w-full h-[400px] md:h-[500px] flex items-center justify-center bg-brand-light rounded-lg shadow-inner">
     <p className="text-brand-primary/50">Loading Products...</p> 
  </div>
);
// --- Loading fallback for 3D Donut ---
const DonutLoadingFallback = () => (
 <div className="w-full h-full flex items-center justify-center">
    <p className="text-brand-primary">Loading 3D model...</p>
  </div>
);


// --- Hero Section (Unchanged) ---
const HeroSection = ({ openModal }) => {
  // ... (Hero Section code remains the same) ...
  const isMobile = useIsMobile();

  return (
    // --- 1. Container set to relative, overflow-hidden ---
    <div id="top" className="container mx-auto min-h-screen flex items-center px-6 py-12 relative overflow-hidden">
      
      {/* The "Giant Sun" gradient is now in App.js,
        so it will appear here automatically.
      */}

      {/* --- 3. Content grid is z-10 (on top of gradient) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
// ... (rest of HeroSection content remains the same) ...
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* --- Rotating Headline --- */}
          <h1 className="text-7xl md:text-8xl font-bold text-brand-primary font-serif leading-tight">
            Baked with{' '}
            <RotatingText 
              texts={['Love', 'Passion', 'Joy', 'Care']}
              rotationInterval={2500}
              staggerDuration={0.015}
              mainClassName="inline-block text-brand-accent font-serif" 
              splitLevelClassName="overflow-hidden" 
              elementLevelClassName="inline-block"
            />
          </h1>
          
          <p className="mt-6 text-lg text-brand-primary opacity-80">
            Welcome to FlourEver, your neighborhood bakery now online.
            One bite and you’ll be in love <strong>FlourEver</strong>
          </p>
          <button
            onClick={openModal}
            className="mt-8 bg-brand-primary text-brand-light text-lg font-medium px-8 py-3 rounded-full shadow-lg
                      hover:bg-opacity-90 transition-all transform hover:scale-105"
          >
            Get Started Now
          </button>
        </motion.div>
        
        {/* --- 2. HIDE DONUT ON MOBILE --- */}
        <motion.div
          className="w-full h-[300px] md:h-[500px] hidden md:block" // <-- RESPONSIVE FIX
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {!isMobile && ( // Double-check to prevent loading on mobile
            <Suspense fallback={<DonutLoadingFallback />}>
              <Donut />
            </Suspense>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// --- Animated Section Component (NOW RESPONSIVE) ---
const AnimatedSection = ({ name, title, children, fullWidth = false, isMobile }) => { // <-- 1. RECEIVE isMobile PROP
  // ... (hooks remain the same) ...
  const motionRef = useRef(null); 
  const { scrollYProgress } = useScroll({
    target: motionRef,
    offset: ["start end", "start start"]
  });
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.3], [50, 0]);

  const { ref: inViewRef, inView } = useInView({ 
      triggerOnce: true, 
      rootMargin: '200px 0px', 
  }); 

  const clipId = `splash-clip-${name}`;

  // --- 2. RENDER SIMPLE RECTANGLE ON MOBILE ---
  if (isMobile) {
    return (
      // --- FIX: Use backticks (`) for template literal ---
      <div id={name} ref={inViewRef} className={`py-16 relative ${fullWidth ? '' : 'px-6'}`}> 
        <motion.div
          ref={motionRef}
          // --- FIX: Use backticks (`) for template literal ---
          className={`text-center bg-brand-secondary/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/10 ${fullWidth ? '' : 'container mx-auto'}`}
          style={{ opacity, y }}
        >
          {/* --- FIX: Use backticks (`) for template literal --- */}
          <h2 className={`text-3xl font-bold text-brand-primary font-serif mb-6 ${fullWidth ? 'container mx-auto px-6' : ''}`}>{title}</h2>
          {/* --- FIX: Use backticks (`) for template literal --- */}
          <div className={`${fullWidth ? '' : 'max-w-5xl mx-auto'} text-base text-brand-primary opacity-90 space-y-4`}> {/* Smaller text */}
            {children({ inView })}
          </div>
        </motion.div>
      </div>
    );
  }

  // --- 3. RENDER DESKTOP (Splash or Rectangle) ---
  
  // --- THIS IS THE FIX ---
  // If it's the "products" section, render a simple rectangle
  if (name === 'products') {
    return (
      // --- FIX: Use backticks (`) for template literal ---
      <div id={name} ref={inViewRef} className={`py-20 md:py-24 relative ${fullWidth ? '' : ''}`}> 
        <motion.div
          ref={motionRef} 
          // --- FIX: Use backticks (`) for template literal ---
          className={`text-center bg-brand-secondary/80 backdrop-blur-md p-12 md:p-16 lg:p-24 shadow-xl border border-white/10 rounded-2xl`}
          style={{ 
            opacity, 
            y,
            // NO clip-path
          }}
          whileHover={{
            scale: 1.02, 
            transition: { type: 'spring', stiffness: 200, damping: 15 }
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* --- FIX: Use backticks (`) for template literal --- */}
          <h2 className={`text-4xl font-bold text-brand-primary font-serif mb-8 container mx-auto px-6`}>{title}</h2>
          {/* --- FIX: Use backticks (`) for template literal --- */}
          <div className={`container mx-auto px-6 text-lg text-brand-primary opacity-90 space-y-6`}>
            {children({ inView })} 
          </div>
        </motion.div>
      </div>
    );
  }

  // --- 4. RENDER SPLASH CARD ON DESKTOP (for About, History, Media) ---
  return (
    // --- FIX: Use backticks (`) for template literal ---
    <div id={name} ref={inViewRef} className={`py-20 md:py-24 relative ${fullWidth ? '' : ''}`}>
      
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d="M0.5,0 C0.6,0 0.65,0.05 0.75,0.05 C0.85,0.05 0.9,0.1 0.95,0.2 C1,0.3 1,0.4 0.95,0.5 C0.9,0.6 0.95,0.7 0.9,0.8 C0.85,0.9 0.8,0.95 0.7,0.95 C0.6,0.95 0.55,1 0.5,1 C0.45,1 0.4,0.95 0.3,0.95 C0.2,0.95 0.15,0.9 0.1,0.8 C0.05,0.7 0.1,0.6 0.05,0.5 C0,0.4 0,0.3 0.05,0.2 C0.1,0.1 0.15,0.05 0.25,0.05 C0.35,0.05 0.4,0 0.5,0 Z" />
          </clipPath>
        </defs>
      </svg>

      <motion.div
        ref={motionRef} 
        // --- FIX: Use backticks (`) for template literal ---
        // --- ADDED 'container mx-auto' to make it "longer" (wider) ---
        // --- ADDED 'fullWidth' LOGIC FIX ---
        className={`text-center bg-brand-secondary/80 backdrop-blur-md p-12 md:p-16 lg:p-24 shadow-xl border border-white/10 ${fullWidth ? '' : 'container mx-auto'}`}
        style={{ 
          opacity, 
          y,
          clipPath: `url(#${clipId})` // Apply splash shape
        }}
        whileHover={{
          scale: 1.02, 
          transition: { type: 'spring', stiffness: 200, damping: 15 }
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* --- FIX: Use backticks (`) for template literal --- */}
        <h2 className={`text-4xl font-bold text-brand-primary font-serif mb-8 container mx-auto px-6`}>{title}</h2>
        {/* --- FIX: Use backticks (`) for template literal --- */}
        {/* We now check for 'fullWidth' to constrain the text OR let the 3D carousel be big */}
        <div className={`${fullWidth ? '' : 'max-w-5xl mx-auto'} text-lg text-brand-primary opacity-90 space-y-6 px-6`}>
          {children({ inView })} 
        </div>
      </motion.div>
    </div>
  );
};

// --- PRODUCT DATA (Moved here) ---
const products = [
  { id: 1, name: 'Cake', gltfPath: '/models/cake/scene.gltf', description: 'Delicious cakes for every occasion. Various flavors available!', iconPath: '/icons/cupcake.png' },
  { id: 2, name: 'Donut', gltfPath: '/models/donut/scene.gltf', description: 'Freshly baked donuts. Classic glaze, chocolate, and more.', iconPath: '/icons/cupcake.png' },
  { id: 3, name: 'Brownie', gltfPath: '/models/brownie/scene.gltf', description: 'Rich, fudgy brownies. Perfect with coffee.', iconPath: '/icons/cupcake.png' },
  { id: 4, name: 'Cookie', gltfPath: '/models/cookie/scene.gltf', description: 'Classic cookies, baked fresh daily.', iconPath: '/icons/cupcake.png' },
  { id: 5, name: 'Coffee', gltfPath: '/models/coffee/scene.gltf', description: 'Brewed coffee to complement your treats.', iconPath: '/icons/cupcake.png' },
];
// Preload
products.forEach(product => {
  useGLTF.preload(product.gltfPath);
  if (product.iconPath) new Image().src = product.iconPath;
});


// --- 1. NEW COMPONENT: 3D Flipping Card for Mobile ---
const CategoryCard = ({ product }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    // This div reserves the space and sets up the 3D perspective
    <div 
      className="w-full h-48 [perspective:1000px]" // Fixed height (h-48) to prevent layout shift
      onClick={() => setIsFlipped(!isFlipped)} // Flip on click
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }} // This enables the 3D flip
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* --- CARD FRONT (Icon + Name) --- */}
        <div 
          className="absolute w-full h-full p-4 rounded-lg shadow-md bg-brand-light 
                     flex flex-col items-center justify-center [backface-visibility:hidden]"
        >
          <img 
            src={product.iconPath} 
            alt={product.name} 
            className="w-16 h-16 mx-auto mb-2 transform -rotate-12"
          />
          <h3 className="font-medium text-brand-primary">{product.name}</h3>
        </div>

        {/* --- CARD BACK (Description) --- */}
        <div 
          className="absolute w-full h-full p-4 rounded-lg shadow-md bg-brand-light 
                     flex flex-col items-center justify-center [transform:rotateY(180deg)] [backface-visibility:hidden]"
        >
          <p className="text-xs text-brand-primary/80 overflow-y-auto">
            {product.description}
          </p>
          <p className="text-xs font-bold text-brand-accent mt-2">(Tap to close)</p>
        </div>
      </motion.div>
    </div>
  );
};


// --- 2. UPDATED: 2D GRID FOR MOBILE PRODUCTS ---
const CategoryGrid = () => (
  <div className="grid grid-cols-2 gap-4">
    {/* This now maps to our new, interactive CategoryCard */}
    {products.map((product) => (
      <CategoryCard key={product.id} product={product} />
    ))}
  </div>
);

// --- FAQ Data (unchanged) ---
const faqData = [
  // ... (faq data) ...
  {
    question: "What are your delivery areas?",
    answer: "We currently deliver to all barangays within Daet, Camarines Norte. We are working on expanding to nearby towns soon!",
    imageSrc: "/images/faq1.png", 
    defaultImage: "/images/faq4.png" 
  },
  {
    question: "How long will my order take?",
    answer: "Our treats are baked fresh! Most orders are delivered within 45-60 minutes. For large or custom cake orders, we recommend ordering at least 1-2 days in advance.",
    imageSrc: "/images/faq3.png"
  },
  {
    question: "What payment methods do you accept?",
    answer: "We currently accept Cash on Delivery (COD). We are working to add Gcash and other online payment options in the near future!",
    imageSrc: "/images/faq5.png", 
  },
  {
    question: "Can I customize my cake order?",
    answer: "Yes! We love making custom cakes for your special occasions. Please contact us through our 'Media' (socials) or our upcoming 'Contact' page to discuss your design.",
    imageSrc: "/images/faq2.png"
  }
];

// --- About Slides (unchanged) ---
const aboutSlides = [
  // ... (slides data) ...
  (
    <>
      <p>
        FlourEver start as a small family dream right here in the heart of Daet, Camarines Norte.
        Our passion is simple: to bake happiness into every bite. We use time honored recipes
        and the freshest local ingredients we can find to create treats that feel like home.
      </p>
      <p>
        From comforting classics to delightful new creations, we pour love into everything
        we bake.
      </p>
    </>
  ),
  (
    <>
      <p>
        We believe every day deserves a little sweetness, and we're thrilled
        to share our passion with our community, now conveniently online! Our new web app
        makes it easier than ever to browse our menu, place an order, and get your
        favorite treats delivered fresh.
      </p>
    </>
  ),
  (
    <>
      <p>
        Our mission is to be your go-to spot for comfort and celebration. Whether it's a
        birthday cake, a box of brownies for the office, or just a little something to
        brighten your day, we're here to make it special.
      </p>
    </>
  )
];


// --- Main Landing Page Component ---
export default function LandingPage({ openModal }) {
  const [faqIndex, setFaqIndex] = useState(-1);
  const isMobile = useIsMobile(); // <-- We need this
  
  // --- 2. ADD NEW STATE FOR PRODUCT MODAL ---
  const [selectedProduct, setSelectedProduct] = useState(null);
  const openProductModal = (product) => setSelectedProduct(product);
  const closeProductModal = () => setSelectedProduct(null);

  return (
    // --- 4. ADDED 'relative isolate' FOR Z-INDEX ---
    <div className="w-full relative isolate">
      
      {/* --- 5. ADDED FALLING PASTRIES (FOR LANDING PAGE ONLY) --- */}
      <div className="fixed inset-0 z-[-10] pointer-events-none">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}> 
          <Suspense fallback={null}> 
            <FallingPastries />
          </Suspense>
        </Canvas>
      </div>
      
      <HeroSection openModal={openModal} />

      {/* --- Wave Divider (Entrance) --- */}
      <div className="relative z-10 -mt-[150px]"> 
        <WaveDivider />
      </div>

      {/* --- Brown Background Wrapper --- */}
      <div 
        className="bg-brand-primary relative z-10 overflow-hidden" 
      >
        <ChocolateChips count={150} /> 

        {/* --- "About" Section --- */}
        <div className="relative z-10">
          {/* --- 4. PASS isMobile PROP --- */}
          <AnimatedSection name="about" title="About FlourEver" isMobile={isMobile}>
          {({ inView }) => ( 
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="w-full md:w-1/2 flex-shrink-0">
                  <ImageCarousel />
                </div>
                {/* --- FIX: Fixed typo w-1D/2 to w-1/2 --- */}
                <div className="w-full md:w-1/2 text-left">
                  <TextSlider slides={aboutSlides} />
                </div>
              </div>
          )}
          </AnimatedSection>
        </div>

        {/* --- "History" Section --- */}
        <div className="relative z-10">
          {/* --- 4. PASS isMobile PROP --- */}
          <AnimatedSection name="history" title="Our Sweet Journey" isMobile={isMobile}>
          {({ inView }) => (<>
              {/* --- FIX: Added spaces back to text --- */}
              <ScrollRevealText className="text-lg">
                Founded in 2025 by a family of passionate bakers, FlourEver quickly became a beloved
                spot in Daet. We started with just a handful of recipes – our signature chocolate cake,
                fluffy ensaymada, and melt-in-your-mouth brownies – baked fresh daily in our humble kitchen.
              </ScrollRevealText>
              <ScrollRevealText className="text-lg">
                Word spread, and soon we were crafting custom cakes for birthdays, weddings, and
                fiestas. Seeing the joy our treats brought inspired us to grow. This website is our
                latest chapter, allowing us to bring a piece of FlourEver magic directly to your doorstep.
              </ScrollRevealText>
          </>)}
          </AnimatedSection>
        </div>
      
      </div> {/* --- END Brown Background Wrapper --- */}

      {/* --- "Exit" Wave --- */}
      {/* --- FIX: Adjusted -mt-[0px] to -mt-[100px] to prevent gap --- */}
      <div className="relative z-10 -mt-[0px] transform rotate-180">
        <WaveDivider />
      </div>

      {/* --- "Products" Section --- */}
      <div className="relative z-10"> 
        {/* --- 4. PASS isMobile PROP --- */}
        <AnimatedSection name="products" title="What We Offer" fullWidth={true} isMobile={isMobile}>
          {({ inView }) => ( 
            <>
              {/* This logic is now correct. The 'isMobile' from the hook */}
              {/* is different from the 'isMobile' in this component's props. */}
              {isMobile ? (
                // On mobile, show the simple 2D icon grid
                <div className="container mx-auto px-10">
                  <CategoryGrid />
                </div>
              ) : (
                // On desktop, show the heavy 3D carousel
                <>
                {inView ? ( 
                  <Suspense fallback={<CarouselPlaceholder />}> 
                    <div className="w-screen -mx-8 lg:-mx-16 xl:-mx-24"> {/* Expand beyond container */}
                      <LazyProductCarousel 
                        products={products} 
                        onProductClick={openProductModal}
                      /> 
                    </div>
                  </Suspense>
                ) : ( 
                  <CarouselPlaceholder /> 
                )}
              </>
              )}
            </>
          )}
        </AnimatedSection>
      </div>

      {/* --- "Media" Section --- */}
      <div className="relative z-10"> 
        {/* --- 4. PASS isMobile PROP --- */}
        <AnimatedSection name="media" title="FlourEver Moments" isMobile={isMobile}>
        {({ inView }) => (
          <>
            {/* --- FIX: Added spaces back to text --- */}
            <ScrollRevealText className="max-w-2xl mx-auto text-lg">
              We love seeing how you enjoy our treats! Here are some of our favorite moments
              from our amazing customers and community events. Drag a card to see the next!
            </ScrollRevealText>
            <div className="mt-12 flex justify-center">
              <MediaStack />
            </div>
          </>
        )}
        </AnimatedSection>
      </div>

    
      {/* --- FAQ Section --- */}
      <motion.div
        id="faq"
        className="container mx-auto px-6 py-20 md:py-24 relative z-10"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-4xl font-bold text-brand-primary font-serif mb-12 text-center">
          Have Questions?
        </h2>
        
        {/* New 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* Left Column (Accordion) */}
          <div className="w-full">
            <FaqAccordion 
              faqData={faqData}
              activeIndex={faqIndex}
              onQuestionClick={setFaqIndex}
            />
          </div>

          {/* Right Column (Image) */}
          <div className="w-full hidden md:block"> {/* Hide on mobile */}
            <FaqImage 
              faqData={faqData}
              activeIndex={faqIndex}
            />
          </div>

        </div>
      </motion.div>

      {/* --- 4. RENDER THE PRODUCT MODAL --- */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            closeModal={closeProductModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}