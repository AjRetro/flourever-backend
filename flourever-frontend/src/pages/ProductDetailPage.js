import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <-- 1. IMPORT 'useAuth'
import api from '../api/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion'; // <-- 2. IMPORT 'AnimatePresence'
import { PlusIcon, MinusIcon, ShoppingBagIcon, ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/solid'; // <-- 3. IMPORT 'CheckIcon'
import { ProductCard } from '../components/ProductCard'; 

// --- Animated Quantity Counter (Unchanged) ---
// ... (code remains the same) ...
const AnimatedCounter = ({ value, onIncrease, onDecrease }) => (
  <div className="flex items-center gap-2">
    <motion.button
      onClick={onDecrease}
      className="w-10 h-10 bg-brand-light border border-brand-primary/20 rounded-full text-brand-primary
                 flex items-center justify-center shadow-sm"
      whileTap={{ scale: 0.9 }}
    >
      <MinusIcon className="w-5 h-5" />
    </motion.button>
    <span className="text-2xl font-bold font-serif w-12 text-center text-brand-primary">
      {value}
    </span>
    <motion.button
      onClick={onIncrease}
      className="w-10 h-10 bg-brand-light border border-brand-primary/20 rounded-full text-brand-primary
                 flex items-center justify-center shadow-sm"
      whileTap={{ scale: 0.9 }}
    >
      <PlusIcon className="w-5 h-5" />
    </motion.button>
  </div>
);

// --- Animated Size Selector (Unchanged) ---
// ... (code remains the same) ...
const SizeSelector = ({ selectedSize, onSelectSize }) => {
  const sizes = ['Regular', 'Large'];
  return (
    <div className="flex space-x-3">
      {sizes.map(size => (
        <button
          key={size}
          onClick={() => onSelectSize(size)}
          className={`relative px-6 py-2 rounded-full text-lg font-medium transition-colors ${
                      selectedSize === size ? 'text-brand-light' : 'text-brand-primary bg-brand-light'
                    }`}
        >
          {selectedSize === size && (
            <motion.div
              layoutId="size-pill"
              className="absolute inset-0 bg-brand-primary rounded-full"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{size}</span>
        </button>
      ))}
    </div>
  );
};


// --- Main Product Detail Page ---
export default function ProductDetailPage() {
  const { productId } = useParams();
  const { user, loading, addToCart } = useAuth(); // <-- 4. GET 'addToCart'
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('Regular');
  
  // --- 5. ADD STATE FOR "ADDED" ANIMATION ---
  const [isAdded, setIsAdded] = useState(false);

  // Fetch Product Data (Unchanged)
  useEffect(() => {
    // ... (code remains the same) ...
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${productId}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
        navigate('/store');
      }
    };
    fetchProduct();
  }, [productId, navigate]);

  // Fetch Recommendations (Unchanged)
  useEffect(() => {
    // ... (code remains the same) ...
    if (product) {
      const fetchRecommendations = async () => {
        try {
          const res = await api.get(`/products/category/${product.category}`);
          setRecommendations(res.data.filter(p => p.id !== product.id).slice(0, 3));
        } catch (err) {
          console.error("Failed to fetch recommendations:", err);
        }
      };
      fetchRecommendations();
    }
  }, [product]);

  // Protected Route (Unchanged)
  useEffect(() => {
    // ... (code remains the same) ...
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // --- 6. ADDED 'useEffect' FOR BUTTON RESET ---
  useEffect(() => {
    if (isAdded) {
      const timer = setTimeout(() => setIsAdded(false), 2000); // Reset after 2s
      return () => clearTimeout(timer);
    }
  }, [isAdded]);

  // --- 7. NEW 'handleAddToCart' FUNCTION ---
  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, size);
    setIsAdded(true);
  };

  if (loading || !product) {
    // ... (loader remains the same) ...
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-16 h-16 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate final price (we need to parse it as a float)
  const finalPrice = (parseFloat(product.price) * quantity * (size === 'Large' ? 1.5 : 1)).toFixed(2);

  return (
    <div className="container mx-auto px-6 py-12">
      
      {/* --- Back Button (Unchanged) --- */}
      <motion.button
        onClick={() => navigate(-1)} // Go back in history
        className="flex items-center gap-2 text-brand-primary mb-8 font-medium
                   hover:text-brand-accent transition-colors"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -5 }}
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Back to Menu
      </motion.button>

      {/* --- Main Product Section (Unchanged) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Image (Unchanged) */}
        <motion.div 
          className="w-full h-96 rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <img src={product.imageURL} alt={product.name} className="w-full h-full object-cover" />
        </motion.div>

        {/* Details (Unchanged) */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h1 className="text-5xl font-bold text-brand-primary font-serif mb-4">{product.name}</h1>
          <p className="text-lg text-brand-primary/80 mb-6">{product.description}</p>
          
          <div className="mb-6">
            <h3 className="text-xl font-bold font-serif text-brand-primary mb-3">Size</h3>
            <SizeSelector selectedSize={size} onSelectSize={setSize} />
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold font-serif text-brand-primary mb-3">Quantity</h3>
            <AnimatedCounter 
              value={quantity}
              onIncrease={() => setQuantity(q => q + 1)}
              onDecrease={() => setQuantity(q => Math.max(1, q - 1))}
            />
          </div>

          {/* --- 8. UPDATED BUTTONS --- */}
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold text-brand-accent">
              PHP {finalPrice}
            </span>
            <motion.button 
              onClick={handleAddToCart}
              // Make button green when item is added!
              className={`flex-1 text-lg font-medium px-8 py-4
                         rounded-full shadow-lg flex items-center justify-center gap-2
                         transition-all duration-300
                         ${isAdded ? 'bg-green-500 text-white' : 'bg-brand-primary text-brand-light'}
                         `}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              disabled={isAdded} // Disable button while "Added"
            >
              <AnimatePresence mode="wait">
                {isAdded ? (
                  <motion.span
                    key="added"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <CheckIcon className="w-6 h-6" />
                    Added to Cart!
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <ShoppingBagIcon className="w-6 h-6" />
                    Add to Cart
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* --- Recommendations Section (Unchanged) --- */}
      {recommendations.length > 0 && (
        <motion.div 
          className="mt-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-brand-primary font-serif mb-6">You May Also Like...</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map(item => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}