import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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
  
  const { authFetch, adminToken } = useAdminAuth();

  const categories = ['Cakes', 'Cupcakes', 'Donuts', 'Brownies', 'Cookies', 'Coffee', 'Breads', 'Pastries', 'Beverages'];

  const fetchProducts = async () => {
    if (!adminToken) return;

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

  const toggleFeatured = async (productId, currentStatus) => {
    try {
      const product = products.find(p => p.id === productId);
      const response = await authFetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      }
    } catch (err) {
      setError('Network error occurred');
    }
  };

  const toggleBestSeller = async (productId, currentStatus) => {
    try {
      const product = products.find(p => p.id === productId);
      const response = await authFetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
  }, [adminToken]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  const filteredProducts = showArchived 
    ? products.filter(product => !product.isActive)
    : products.filter(product => product.isActive);

  const activeProductsCount = products.filter(p => p.isActive).length;
  const archivedProductsCount = products.filter(p => !p.isActive).length;

  if (loading && !products.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
          <p className="text-gray-500">Manage your bakery products</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center space-x-2 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Product</span>
        </button>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => setShowArchived(false)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            !showArchived ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Active ({activeProductsCount})
        </button>
        <button
          onClick={() => setShowArchived(true)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            showArchived ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Archived ({archivedProductsCount})
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError('')} className="float-right text-red-800 hover:text-red-900">×</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow ${
              !product.isActive ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
            }`}
          >
            {!product.isActive && (
              <div className="bg-orange-500 text-white text-xs px-3 py-1 text-center font-bold">
                Archived
              </div>
            )}
            
            <div className="flex justify-between items-start p-3 pb-0">
              <div className="flex space-x-1">
                {product.isFeatured && (
                  <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">Featured</span>
                )}
                {product.isBestSeller && (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">Best Seller</span>
                )}
              </div>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{product.category}</span>
            </div>
            
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 mt-2">
              <img
                src={product.imageURL || '/api/placeholder/300/200'}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-gray-800 text-lg mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleFeatured(product.id, product.isFeatured)}
                    className={`p-2 rounded transition-colors ${
                      product.isFeatured ? 'text-purple-600 bg-purple-100' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={product.isFeatured ? 'Remove Featured' : 'Mark Featured'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363 1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                  </button>

                  <button
                    onClick={() => toggleBestSeller(product.id, product.isBestSeller)}
                    className={`p-2 rounded transition-colors ${
                      product.isBestSeller ? 'text-yellow-600 bg-yellow-100' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={product.isBestSeller ? 'Remove Best Seller' : 'Mark Best Seller'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  </button>
                  
                  {product.isActive ? (
                    <button onClick={() => archiveProduct(product.id)} disabled={deletingProduct === product.id} className="text-orange-600 hover:bg-orange-50 p-2 rounded" title="Archive">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                    </button>
                  ) : (
                    <button onClick={() => restoreProduct(product.id)} disabled={deletingProduct === product.id} className="text-green-600 hover:bg-green-50 p-2 rounded" title="Restore">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                  )}
                  
                  <button onClick={() => handleEditProduct(product)} className="text-blue-600 hover:bg-blue-50 p-2 rounded" title="Edit">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

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

const ProductModal = ({ mode, product, onClose, onProductAdded, onProductUpdated, categories }) => {
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: '', imageURL: '', isFeatured: false, isBestSeller: false
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
      setFormData(prev => ({ ...prev, isFeatured: true }));
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
      setError('Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) await handleImageUpload(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = mode === 'add' ? '/api/admin/products' : `/api/admin/products/${product.id}`;
      const method = mode === 'add' ? 'POST' : 'PUT';
      const response = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, price: parseFloat(formData.price) }),
      });

      if (response.ok) {
        mode === 'add' ? onProductAdded() : onProductUpdated();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold mb-4">{mode === 'add' ? 'Add Product' : 'Edit Product'}</h2>
        {error && <div className="mb-4 text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required className="w-full border p-2 rounded" />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required className="w-full border p-2 rounded" />
          <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Price" required className="w-full border p-2 rounded" />
          <select name="category" value={formData.category} onChange={handleChange} required className="w-full border p-2 rounded">
            <option value="">Category</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex gap-4">
            <label className="flex items-center gap-2"><input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} /> Featured</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="isBestSeller" checked={formData.isBestSeller} onChange={handleChange} /> Best Seller</label>
          </div>
          <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploadingImage} className="w-full" />
          {formData.imageURL && <img src={formData.imageURL} alt="Preview" className="w-20 h-20 object-cover rounded" />}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-200 p-2 rounded">Cancel</button>
            <button type="submit" disabled={loading || uploadingImage} className="flex-1 bg-blue-600 text-white p-2 rounded">{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductManagement;