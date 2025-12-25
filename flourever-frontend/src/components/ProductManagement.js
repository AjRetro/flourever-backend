import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// --- Cloudinary Upload Details ---
const CLOUDINARY_CLOUD_NAME = "dbcjwlgwm";
const CLOUDINARY_UPLOAD_PRESET = "flourever_preset";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  
  const { authFetch } = useAdminAuth();

  const categories = ['Cakes', 'Cupcakes', 'Donuts', 'Brownies', 'Cookies', 'Coffee'];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/api/admin/products');

      if (response.ok) {
        const productsData = await response.json();
        setProducts(productsData);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const archiveProduct = async (productId) => {
    try {
      setDeletingProduct(productId);
      const response = await authFetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Update local state - mark as inactive
        setProducts(prevProducts =>
          prevProducts.map(product =>
            product.id === productId ? { ...product, isActive: false } : product
          )
        );
      } else {
        setError('Failed to archive product');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setDeletingProduct(null);
    }
  };

  const restoreProduct = async (productId) => {
    try {
      setDeletingProduct(productId);
      const response = await authFetch(`/api/admin/products/${productId}/restore`, {
        method: 'PUT',
      });

      if (response.ok) {
        // Update local state - mark as active
        setProducts(prevProducts =>
          prevProducts.map(product =>
            product.id === productId ? { ...product, isActive: true } : product
          )
        );
      } else {
        setError('Failed to restore product');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setDeletingProduct(null);
    }
  };

  // NEW: Toggle featured status
  const toggleFeatured = async (productId, currentStatus) => {
    try {
      const product = products.find(p => p.id === productId);
      const response = await authFetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          imageURL: product.imageURL,
          isFeatured: !currentStatus,
          isBestSeller: product.isBestSeller
        }),
      });

      if (response.ok) {
        setProducts(prevProducts =>
          prevProducts.map(product =>
            product.id === productId ? { ...product, isFeatured: !currentStatus } : product
          )
        );
      } else {
        setError('Failed to update featured status');
      }
    } catch (err) {
      setError('Network error occurred');
    }
  };

  // NEW: Toggle best seller status
  const toggleBestSeller = async (productId, currentStatus) => {
    try {
      const product = products.find(p => p.id === productId);
      const response = await authFetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          imageURL: product.imageURL,
          isFeatured: product.isFeatured,
          isBestSeller: !currentStatus
        }),
      });

      if (response.ok) {
        setProducts(prevProducts =>
          prevProducts.map(product =>
            product.id === productId ? { ...product, isBestSeller: !currentStatus } : product
          )
        );
      } else {
        setError('Failed to update best seller status');
      }
    } catch (err) {
      setError('Network error occurred');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  // Filter products based on showArchived state
  const filteredProducts = showArchived 
    ? products.filter(product => !product.isActive)
    : products.filter(product => product.isActive);

  const activeProductsCount = products.filter(p => p.isActive).length;
  const archivedProductsCount = products.filter(p => !p.isActive).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Product Management</h1>
          <p className="text-brand-primary/70">Manage your bakery products</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-brand-accent text-white px-4 py-2 rounded-lg hover:bg-brand-primary transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Product</span>
        </button>
      </div>

      {/* Archive Toggle */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => setShowArchived(false)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            !showArchived 
              ? 'bg-brand-accent text-white' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Active Products ({activeProductsCount})
        </button>
        <button
          onClick={() => setShowArchived(true)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            showArchived 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Archived Products ({archivedProductsCount})
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button 
            onClick={() => setError('')}
            className="float-right text-red-800 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-brand-light rounded-lg border overflow-hidden hover:shadow-lg transition-shadow ${
              !product.isActive ? 'border-orange-300 bg-orange-50' : 'border-brand-primary/10'
            }`}
          >
            {!product.isActive && (
              <div className="bg-orange-500 text-white text-xs px-3 py-1 text-center">
                Archived
              </div>
            )}
            
            {/* NEW: Status Badges */}
            <div className="flex justify-between items-start p-3 pb-0">
              <div className="flex space-x-1">
                {product.isFeatured && (
                  <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                    Featured
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                    Best Seller
                  </span>
                )}
              </div>
              <span className="bg-brand-secondary text-brand-accent text-xs px-2 py-1 rounded-full">
                {product.category}
              </span>
            </div>
            
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              <img
                src={product.imageURL || '/api/placeholder/300/200'}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-brand-primary text-lg mb-2">{product.name}</h3>
              
              <p className="text-brand-primary/70 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-brand-primary">
                  {formatPrice(product.price)}
                </span>
                
                <div className="flex space-x-2">
                  {/* NEW: Featured Toggle */}
                  <button
                    onClick={() => toggleFeatured(product.id, product.isFeatured)}
                    className={`p-2 rounded transition-colors ${
                      product.isFeatured 
                        ? 'text-purple-600 bg-purple-100 hover:bg-purple-200' 
                        : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                    title={product.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>

                  {/* NEW: Best Seller Toggle */}
                  <button
                    onClick={() => toggleBestSeller(product.id, product.isBestSeller)}
                    className={`p-2 rounded transition-colors ${
                      product.isBestSeller 
                        ? 'text-yellow-600 bg-yellow-100 hover:bg-yellow-200' 
                        : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                    }`}
                    title={product.isBestSeller ? 'Remove from Best Sellers' : 'Mark as Best Seller'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </button>
                  
                  {/* Archive/Restore Button */}
                  {product.isActive ? (
                    <button
                      onClick={() => archiveProduct(product.id)}
                      disabled={deletingProduct === product.id}
                      className="text-orange-600 hover:text-orange-800 disabled:opacity-50 transition-colors p-2"
                      title="Archive Product"
                    >
                      {deletingProduct === product.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => restoreProduct(product.id)}
                      disabled={deletingProduct === product.id}
                      className="text-green-600 hover:text-green-800 disabled:opacity-50 transition-colors p-2"
                      title="Restore Product"
                    >
                      {deletingProduct === product.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                    </button>
                  )}
                  
                  {/* Edit Button */}
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="text-brand-primary hover:text-brand-accent transition-colors p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-brand-light rounded-lg border border-brand-primary/10">
          <svg className="mx-auto h-12 w-12 text-brand-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-brand-primary">
            {showArchived ? 'No archived products' : 'No products'}
          </h3>
          <p className="mt-1 text-sm text-brand-primary/70">
            {showArchived 
              ? 'Products you archive will appear here' 
              : 'Get started by adding your first bakery product.'}
          </p>
          {!showArchived && (
            <div className="mt-6">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-accent hover:bg-brand-primary"
              >
                Add Product
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Product Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <ProductModal
            mode="add"
            onClose={() => setIsAddModalOpen(false)}
            onProductAdded={fetchProducts}
            categories={categories}
          />
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <ProductModal
            mode="edit"
            product={editingProduct}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingProduct(null);
            }}
            onProductUpdated={fetchProducts}
            categories={categories}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Updated Product Modal Component
const ProductModal = ({ mode, product, onClose, onProductAdded, onProductUpdated, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageURL: '',
    isFeatured: false,
    isBestSeller: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const { authFetch } = useAdminAuth();

  useEffect(() => {
    if (mode === 'edit' && product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        imageURL: product.imageURL || '',
        isFeatured: product.isFeatured || false,
        isBestSeller: product.isBestSeller || false
      });
    } else if (mode === 'add') {
      // NEW: Set new products as featured (This Week Special) by default
      setFormData(prev => ({
        ...prev,
        isFeatured: true
      }));
    }
  }, [mode, product]);

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    setError('');

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: uploadData,
      });
      
      if (!res.ok) throw new Error('Upload failed');
      
      const data = await res.json();
      setFormData(prev => ({ ...prev, imageURL: data.secure_url }));
    } catch (err) {
      setError('Image upload failed. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    await handleImageUpload(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = mode === 'add' 
        ? '/api/admin/products' 
        : `/api/admin/products/${product.id}`;
      
      const method = mode === 'add' ? 'POST' : 'PUT';

      const response = await authFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price)
        }),
      });

      if (response.ok) {
        if (mode === 'add') {
          onProductAdded();
        } else {
          onProductUpdated();
        }
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || `Failed to ${mode} product`);
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {mode === 'add' ? 'Add New Product' : 'Edit Product'}
          </h2>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
                placeholder="Chocolate Cake"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                required
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
                placeholder="Delicious chocolate cake with rich frosting..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (PHP) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="price"
                required
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
                placeholder="299.99"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* NEW: Featured and Best Seller Checkboxes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Featured Item
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isBestSeller"
                  checked={formData.isBestSeller}
                  onChange={handleChange}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Best Seller
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Image
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
                  disabled={uploadingImage}
                />
                {uploadingImage && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-accent"></div>
                )}
              </div>
              {formData.imageURL && (
                <div className="mt-2">
                  <img src={formData.imageURL} alt="Preview" className="w-20 h-20 object-cover rounded-lg border" />
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="flex-1 px-4 py-2 text-white bg-brand-accent rounded-lg hover:bg-brand-primary disabled:opacity-50 transition-colors"
              >
                {loading ? (mode === 'add' ? 'Adding...' : 'Updating...') : (mode === 'add' ? 'Add Product' : 'Update Product')}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductManagement;