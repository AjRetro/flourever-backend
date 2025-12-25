import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { ArchiveBoxIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import OrderTracker from '../components/OrderTracker';

// --- Single Order Card Component ---
const OrderCard = ({ order }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Fetch items ONLY when the user expands the card
  const handleExpand = async () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && items.length === 0) {
      setLoadingItems(true);
      try {
        const res = await api.get(`/orders/${order.id}`);
        setItems(res.data.items);
      } catch (err) {
        console.error("Error fetching items:", err);
      }
      setLoadingItems(false);
    }
  };

  // Format Date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', 
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <motion.div 
      layout
      className="bg-brand-light rounded-2xl shadow-md border border-brand-primary/10 overflow-hidden"
    >
      {/* --- Card Header (Always visible) --- */}
      <div className="p-6 cursor-pointer hover:bg-brand-secondary/20 transition-colors" onClick={handleExpand}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-brand-primary/60 font-bold uppercase tracking-wider">
              Order #{order.id}
            </p>
            <h3 className="text-lg font-serif font-bold text-brand-primary">
              {formatDate(order.orderDate)}
            </h3>
          </div>
          <p className="text-2xl font-bold text-brand-accent">
            PHP {parseFloat(order.totalPrice).toFixed(2)}
          </p>
        </div>

        {/* --- VISUAL TRACKER --- */}
        <OrderTracker 
          status={order.orderStatus} 
          orderId={order.id}
          rating={order.rating}            
          issueReported={order.issue_reported}
        />
        
        <div className="flex justify-center mt-2">
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
            <ChevronDownIcon className="w-5 h-5 text-brand-primary/50" />
          </motion.div>
        </div>
      </div>

      {/* --- Expanded Details (Collapsible) --- */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-brand-primary/10 bg-white/50 px-6 py-4"
          >
            <h4 className="font-bold text-brand-primary mb-3">Order Items</h4>
            
            {loadingItems ? (
               <p className="text-brand-primary/60">Loading items...</p>
            ) : (
              <div className="space-y-3 mb-6">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <img src={item.imageURL} alt={item.name} className="w-12 h-12 rounded-md object-cover border border-brand-primary/10" />
                    <div className="flex-1">
                      <p className="font-medium text-brand-primary">{item.name}</p>
                      <p className="text-xs text-brand-primary/70">{item.size} x {item.quantity}</p>
                    </div>
                    {/* FIX IS HERE: Use priceAtPurchase instead of price */}
                    <p className="font-bold text-brand-primary">
                        PHP {parseFloat(item.priceAtPurchase).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-brand-primary/80 bg-brand-secondary/20 p-4 rounded-xl">
              <div>
                <p className="font-bold text-brand-primary">Delivery Address</p>
                <p>{order.deliveryAddress}</p>
              </div>
               <div>
                <p className="font-bold text-brand-primary">Contact Number</p>
                <p>{order.contactNumber}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Main Page Component ---
export default function MyOrdersPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
      return;
    }
    
    if (user) {
      const fetchOrders = async () => {
        try {
          const res = await api.get('/orders');
          setOrders(res.data);
          setLastUpdated(new Date());
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoadingOrders(false);
        }
      };
      
      fetchOrders(); // Initial fetch
      
      // Set up auto-refresh every 30 seconds
      const interval = setInterval(fetchOrders, 30000);
      
      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [user, loading, navigate]);

  const manualRefresh = () => {
    setIsLoadingOrders(true);
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data);
        setLastUpdated(new Date());
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingOrders(false);
      }
    };
    fetchOrders();
  };

  if (loading || isLoadingOrders) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-brand-primary font-serif">My Orders</h1>
            {lastUpdated && (
              <p className="text-brand-primary/60 text-sm mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={manualRefresh}
            disabled={isLoadingOrders}
            className="bg-brand-accent text-white px-4 py-2 rounded-lg hover:bg-brand-primary disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isLoadingOrders ? 'Refreshing...' : 'Refresh Orders'}</span>
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-brand-light/50 rounded-3xl border border-brand-primary/10">
            <ArchiveBoxIcon className="w-24 h-24 mx-auto text-brand-primary/20 mb-4" />
            <h2 className="text-2xl font-serif font-bold text-brand-primary">No orders yet</h2>
            <p className="text-brand-primary/70 mb-6">Time to treat yourself to something sweet!</p>
            <Link to="/store" className="bg-brand-accent text-white px-6 py-3 rounded-full font-bold hover:bg-opacity-90 transition-all">
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}