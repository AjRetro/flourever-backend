import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapContainer, TileLayer, Marker, Popup 
} from 'react-leaflet';
import { 
  StarIcon, ExclamationTriangleIcon, 
  ArrowPathIcon
} from '@heroicons/react/24/solid';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- FIX LEAFLET ICONS ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  const { authFetch, adminToken } = useAdminAuth();

  const statusOptions = ['Pending', 'Baking', 'Out for Delivery', 'Delivered', 'Cancelled', 'Redelivering'];
  const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Baking': 'bg-blue-100 text-blue-800', 
    'Out for Delivery': 'bg-purple-100 text-purple-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800',
    'Redelivering': 'bg-orange-100 text-orange-800'
  };

  const fetchOrders = async () => {
    if (!adminToken) return;

    try {
      setLoading(true);
      const response = await authFetch('/api/admin/orders');

      if (response.ok) {
        const ordersData = await response.json();
        setOrders(ordersData);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      const response = await authFetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId ? { ...order, orderStatus: newStatus } : order
          )
        );
      } else {
        setError('Failed to update order status');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  useEffect(() => {
    fetchOrders();
  }, [adminToken]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <StarIcon key={i} className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} />
        ))}
      </div>
    );
  };

  if (loading && !orders.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
        <p className="text-gray-500">Manage and update customer orders</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError('')} className="float-right text-red-800 hover:text-red-900">×</button>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by receiving some customer orders.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${order.issue_reported ? 'bg-red-50 hover:bg-red-100' : ''}`}
                      onClick={() => toggleOrderExpansion(order.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Order #{order.id}</div>
                          <div className="text-sm text-gray-500">{formatDate(order.orderDate)}</div>
                          <div className="text-xs text-blue-600 mt-1 flex items-center font-bold">
                            {expandedOrder === order.id ? 'Click to close' : 'View details'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.firstName} {order.lastName}</div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.issue_reported ? (
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-200 text-red-800 animate-pulse">
                             <ExclamationTriangleIcon className="w-3 h-3 mr-1" /> Issue Reported
                           </span>
                        ) : order.rating ? (
                           <div className="flex items-center gap-1">
                             <StarIcon className="w-4 h-4 text-yellow-400" />
                             <span className="text-sm font-bold text-gray-700">{order.rating}.0</span>
                           </div>
                        ) : (
                           <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-800'}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={order.orderStatus}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            disabled={updatingOrder === order.id}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                          {updatingOrder === order.id && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>}
                        </div>
                      </td>
                    </motion.tr>
                    
                    <AnimatePresence>
                      {expandedOrder === order.id && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-gray-50"
                        >
                          <td colSpan="5" className="px-6 py-4">
                            {/* FEEDBACK SECTION */}
                            {(order.rating || order.issue_reported) && (
                              <div className={`mb-6 p-4 rounded-lg border ${order.issue_reported ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                {order.issue_reported ? (
                                  <div>
                                    <div className="flex items-center gap-2 mb-2 text-red-800 font-bold">
                                      <ExclamationTriangleIcon className="w-5 h-5" />
                                      <h3>Customer Reported an Issue</h3>
                                    </div>
                                    <div className="text-sm text-red-700 ml-7 space-y-1">
                                      <p><span className="font-semibold">Issue:</span> {order.issue_reported}</p>
                                      <p><span className="font-semibold">Details:</span> "{order.feedback}"</p>
                                      {order.request_redelivery && (
                                        <div className="mt-3 flex items-center gap-4 bg-white p-3 rounded-lg border border-red-100">
                                          <span className="font-bold flex items-center gap-2">
                                            <ArrowPathIcon className="w-4 h-4" /> Requesting Redelivery
                                          </span>
                                          <button 
                                            onClick={() => updateOrderStatus(order.id, 'Redelivering')}
                                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                          >
                                            Approve Redelivery
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-start gap-3">
                                    <div className="bg-white p-2 rounded-lg border border-green-100 shadow-sm">
                                      {renderStars(order.rating)}
                                    </div>
                                    <div>
                                      <p className="font-bold text-green-800">Customer Feedback</p>
                                      <p className="text-sm text-green-700 italic">"{order.feedback}"</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Order Items */}
                              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">Order Items</h4>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                  {order.items && order.items.map((item, index) => (
                                    <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                      <img 
                                        src={item.imageURL || '/api/placeholder/100/100'} 
                                        alt={item.name}
                                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                      />
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-900">{item.name}</p>
                                        <p className="text-sm text-gray-600">{item.size} × {item.quantity}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-semibold text-gray-900">{formatPrice(item.priceAtPurchase * item.quantity)}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                                  <span className="text-sm text-gray-500">Total Items: {order.items?.length}</span>
                                  <span className="text-lg font-bold text-gray-800">{formatPrice(order.totalPrice)}</span>
                                </div>
                              </div>

                              {/* Delivery Info */}
                              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex flex-col">
                                <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">Delivery Information</h4>
                                <div className="space-y-3 mb-4">
                                  <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</span>
                                    <p className="text-gray-800 font-medium">{order.contactNumber}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Address</span>
                                    <p className="text-gray-800 text-sm">{order.deliveryAddress}</p>
                                  </div>
                                  {order.delivery_instructions && (
                                    <div className="bg-yellow-50 p-2 rounded border border-yellow-100">
                                      <span className="text-xs font-bold text-yellow-700 uppercase tracking-wider">Instructions</span>
                                      <p className="text-yellow-800 text-sm italic">"{order.delivery_instructions}"</p>
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 w-full min-h-[200px] rounded-lg overflow-hidden border border-gray-300 relative z-0">
                                  {order.delivery_lat && order.delivery_lng ? (
                                    <MapContainer 
                                      center={[order.delivery_lat, order.delivery_lng]} 
                                      zoom={15} 
                                      style={{ height: "100%", width: "100%" }}
                                    >
                                      <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; OpenStreetMap contributors'
                                      />
                                      <Marker position={[order.delivery_lat, order.delivery_lng]}>
                                        <Popup>
                                          <strong>{order.firstName} {order.lastName}</strong><br />
                                          {order.deliveryAddress}
                                        </Popup>
                                      </Marker>
                                    </MapContainer>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center h-full bg-gray-100 text-gray-400">
                                      <span className="text-sm font-medium">No GPS Data Available</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;