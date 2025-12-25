import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// --- 1. ADDED Chevron Icons for the scroll arrows ---
import { 
  ArrowRightIcon, ShoppingBagIcon, ArchiveBoxIcon, 
  ChevronLeftIcon, ChevronRightIcon 
} from '@heroicons/react/24/solid';
import { CakeSliceIcon, DonutIcon, CookieIcon, CoffeeIcon, SquareIcon } from 'lucide-react'; 
import api from '../api/axiosConfig';
import { ProductCard } from '../components/ProductCard';

// --- Reusable Bento Box Component (Unchanged) ---
const BentoBox = ({ className = '', children, href, onClick }) => {
  const content = (
    <motion.div
      className={`relative w-full h-full p-6 rounded-2xl shadow-lg
                  bg-brand-light border border-brand-primary/10
                  transition-all duration-300
                  hover:shadow-2xl hover:border-brand-primary/30
                  ${onClick ? 'cursor-pointer' : ''}
                  ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );

  if (href) {
    return (
      <Link to={href} className="block w-full h-full">
        {content}
      </Link>
    );
  }
  return content;
};

// --- Category Icon Helper (Unchanged) ---
const CategoryIcon = ({ category }) => {
  const iconClass = "w-10 h-10 text-brand-accent mb-2";
  switch (category) {
    case 'Cakes': return <CakeSliceIcon className={iconClass} />;
    case 'Donuts': return <DonutIcon className={iconClass} />;
    case 'Brownies': return <SquareIcon className={iconClass} fill="currentColor" />;
    case 'Cookies': return <CookieIcon className={iconClass} />;
    case 'Coffee': return <CoffeeIcon className={iconClass} />;
    default: return <CakeSliceIcon className={iconClass} />;
  }
};

// --- NEW: Scrollable Product Section Component ---
// This handles the title, the arrows, and the scrolling logic
const ScrollableSection = ({ title, items }) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 300; // Adjust scroll distance
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <motion.div 
      className="mt-16"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-3xl font-bold text-brand-primary font-serif">
          {title}
        </h2>
        {/* Scroll Arrows */}
        <div className="flex gap-2">
          <button 
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-brand-light border border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors shadow-sm"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-brand-light border border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors shadow-sm"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Container */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-6 pb-8 -mx-6 px-6 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar for Firefox/IE
      >
        {items.map((product) => (
          <div key={product.id} className="min-w-[280px] md:min-w-[320px] snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </motion.div>
  );
};


// --- Main Store Page Component ---
function StorePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentCatIndex, setCurrentCatIndex] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const uniqueCategories = [...new Set(products.map(p => p.category))];
      setCategories(uniqueCategories);
    }
  }, [products]);

  useEffect(() => {
    if (categories.length === 0) return;
    const interval = setInterval(() => {
      setCurrentCatIndex(prevIndex => (prevIndex + 1) % categories.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [categories]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // --- UPDATED: Removed .slice(0, 3) to allow full list scrolling ---
  const featuredItems = useMemo(() => {
    return products.filter(p => p.isFeatured); 
  }, [products]);

  // --- UPDATED: Removed .slice(0, 3) to allow full list scrolling ---
  const bestSellers = useMemo(() => {
    return products.filter(p => p.isBestSeller);
  }, [products]);

  const specialProduct = useMemo(() => {
    return products.find(p => p.isFeatured) || products[0] || {};
  }, [products]);

  const handleSpecialProductClick = () => {
    if (specialProduct.id) {
      navigate(`/product/${specialProduct.id}`);
    }
  };

  if (loading || !user) return null;
  
  const cat1 = categories[currentCatIndex];
  const cat2 = categories.length > 1 ? categories[(currentCatIndex + 1) % categories.length] : null;

  return (
    <div className="container mx-auto px-6 py-12">
      
      {/* --- Header --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-4xl font-bold text-brand-primary font-serif mb-2">
          Welcome, {user.firstName}!
        </h1>
        <p className="text-lg text-brand-primary/80">
          What are you craving today?
        </p>
      </motion.div>

      {/* --- Bento Grid --- */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 auto-rows-[180px] gap-4 md:gap-6 mt-8"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.05 } }
        }}
      >
        {/* Box 1: This Week's Special */}
        <BentoBox 
          className="md:col-span-2 md:row-span-2 bg-brand-primary text-brand-light overflow-hidden relative"
          onClick={handleSpecialProductClick}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: specialProduct.imageURL ? `url(${specialProduct.imageURL})` : 'none',
              backgroundColor: !specialProduct.imageURL ? 'rgb(139, 69, 19)' : 'transparent'
            }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold font-serif mb-2">This Week's Special</h2>
              <p className="text-brand-light/90 font-medium text-lg">{specialProduct.name || 'Weekly Special'}</p>
              <p className="text-brand-light/70 text-sm mt-2 line-clamp-3">
                {specialProduct.description || 'Our specially curated treat for this week!'}
              </p>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-3xl font-bold">PHP {specialProduct.price || '0'}</span>
              <div className="flex items-center text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                Order Now <ArrowRightIcon className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
        </BentoBox>

        {/* Box 2: "My Orders" Link */}
        <BentoBox className="md:col-span-2 flex flex-col justify-between" href="/my-orders">
          <div>
            <h2 className="text-2xl font-bold font-serif text-brand-primary">Track Your Order</h2>
            <p className="text-brand-primary/80">Check the status of your delivery</p>
          </div>
          <ArchiveBoxIcon className="w-16 h-16 text-brand-primary/20 absolute bottom-4 right-6" />
          <div className="text-brand-accent font-medium flex items-center">
            View My Orders <ArrowRightIcon className="w-4 h-4 ml-1" />
          </div>
        </BentoBox>

        {/* Box 3: All Products Link */}
        <BentoBox className="md:col-span-2 flex flex-col justify-between" href="/store/all-products">
          <div>
            <h2 className="text-2xl font-bold font-serif text-brand-primary">Browse All Treats</h2>
            <p className="text-brand-primary/80">View our full bakery menu</p>
          </div>
          <ShoppingBagIcon className="w-16 h-16 text-brand-primary/20 absolute bottom-4 right-6" />
          <div className="text-brand-accent font-medium flex items-center">
            Full Menu <ArrowRightIcon className="w-4 h-4 ml-1" />
          </div>
        </BentoBox>

        {/* Box 4: CATEGORY CAROUSEL 1 */}
        <BentoBox 
          className="flex flex-col items-center justify-center relative overflow-hidden"
          href={cat1 ? `/store/all-products?category=${cat1}` : '/store/all-products'}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={cat1 || 'loading-cat-1'} 
              className="w-full h-full flex flex-col items-center justify-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CategoryIcon category={cat1} />
              <h3 className="text-xl font-serif font-medium text-brand-primary">{cat1 || '...'}</h3>
            </motion.div>
          </AnimatePresence>
        </BentoBox>

        {/* Box 5: CATEGORY CAROUSEL 2 */}
        <BentoBox 
          className="flex flex-col items-center justify-center relative overflow-hidden"
          href={cat2 ? `/store/all-products?category=${cat2}` : '/store/all-products'}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={cat2 || 'loading-cat-2'} 
              className="w-full h-full flex flex-col items-center justify-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CategoryIcon category={cat2} />
              <h3 className="text-xl font-serif font-medium text-brand-primary">{cat2 || '...'}</h3>
            </motion.div>
          </AnimatePresence>
        </BentoBox>
      </motion.div>

      {/* --- UPDATED SECTIONS WITH SCROLL ARROWS --- */}
      <ScrollableSection title="Featured Items" items={featuredItems} />
      <ScrollableSection title="Best Sellers" items={bestSellers} />

    </div>
  );
}

export default StorePage;