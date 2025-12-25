import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
// --- 1. IMPORT useSearchParams ---
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '../components/ProductCard'; 
import api from '../api/axiosConfig';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

// --- Animated Tab Component (Unchanged) ---
const CategoryTabs = ({ categories, activeCategory, onCategoryChange }) => (
  <div className="flex w-full overflow-x-auto space-x-2 p-1 bg-brand-light rounded-full shadow-inner">
    {/* "All" Tab */}
    <button
      onClick={() => onCategoryChange(null)}
      className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors
                  ${activeCategory === null ? 'text-brand-light' : 'text-brand-primary/70 hover:text-brand-primary'}`}
    >
      {activeCategory === null && (
        <motion.div 
          layoutId="tab-pill" 
          className="absolute inset-0 bg-brand-primary rounded-full"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <span className="relative z-10">All</span>
    </button>
    
    {/* Map over the other categories */}
    {categories.map(category => (
      <button
        key={category}
        onClick={() => onCategoryChange(category)}
        className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors
                    whitespace-nowrap
                    ${activeCategory === category ? 'text-brand-light' : 'text-brand-primary/70 hover:text-brand-primary'}`}
      >
        {activeCategory === category && (
          <motion.div 
            layoutId="tab-pill" 
            className="absolute inset-0 bg-brand-primary rounded-full"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        <span className="relative z-10">{category}</span>
      </button>
    ))}
  </div>
);

// --- Main "All Products" Page ---
function AllProductsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // --- 2. GET URL PARAMS ---
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category'); // e.g., "Cakes" or "Donuts"

  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  // --- 3. SET INITIAL STATE FROM URL ---
  const [activeCategory, setActiveCategory] = useState(categoryFromUrl || null); 

  // 1. Fetch all products (Unchanged)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setAllProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []); 

  // 2. Get categories (Unchanged)
  const categories = useMemo(() => {
    return [...new Set(allProducts.map(p => p.category))];
  }, [allProducts]);

  // 3. Filter products (Unchanged)
  const filteredProducts = useMemo(() => {
    let products = allProducts;
    if (activeCategory) {
      products = products.filter(p => p.category === activeCategory);
    }
    if (searchQuery) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return products;
  }, [allProducts, activeCategory, searchQuery]);

  // --- Protected Route logic (Unchanged) ---
  useEffect(() => {
    if (!loading && !user) {
      navigate('/'); 
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return null; 
  }

  return (
    <div className="container mx-auto px-6 py-12">
      {/* --- Header (Unchanged) --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-brand-primary font-serif mb-4">
          Our Full Menu
        </h1>
        <p className="text-lg text-brand-primary/80 mb-8">
          Find your new favorite treat.
        </p>
      </motion.div>

      {/* --- Filters (Search + Tabs) (FIXED) --- */}
<div className="sticky top-[80px] z-20 bg-brand-secondary/80 backdrop-blur-md p-4 rounded-xl shadow-lg mb-8">
  <div className="flex flex-col md:flex-row gap-4">
    
    <div className="relative flex-grow">
      <input 
        type="text"
        placeholder="Search for a treat..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-3 rounded-full border border-brand-primary/20 bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-accent text-base" // Added py-3 and text-base
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="w-5 h-5 text-brand-primary/40" />
      </div>
    </div>

    <CategoryTabs 
      categories={categories}
      activeCategory={activeCategory}
      onCategoryChange={setActiveCategory}
    />
  </div>
</div>
      
      {/* --- Product Grid (Unchanged) --- */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <motion.div 
              className="col-span-full text-center p-12 bg-brand-light rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h3 className="text-2xl font-serif text-brand-primary">No treats found!</h3>
              <p className="text-brand-primary/80">Try a different search or category.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default AllProductsPage;