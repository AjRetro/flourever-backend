import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import AdminSidebar from '../components/AdminSidebar';
import ProductManagement from '../components/ProductManagement';
import OrderManagement from '../components/OrderManagement';
import UserManagement from '../components/UserManagement';
import AdminHeader from '../components/AdminHeader';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Fixed width, no animation */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 lg:static lg:z-auto">
        <AdminSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          currentPath={location.pathname}
        />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0"> {/* Changed from lg:pl-64 to min-w-0 */}
        {/* Header */}
        <AdminHeader 
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />
        
        {/* Main content area - NO WRAPPERS, NO ANIMATIONS */}
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/users" element={<UserManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { authFetch } = useAdminAuth();

  const fetchStats = async () => {
    try {
      const response = await authFetch('/api/admin/dashboard/stats');
      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-primary mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-brand-light p-6 rounded-lg border border-brand-primary/10">
          <h3 className="text-lg font-semibold text-brand-primary/70">Total Products</h3>
          <p className="text-3xl font-bold text-brand-accent">{stats?.totalProducts || 0}</p>
        </div>
        <div className="bg-brand-light p-6 rounded-lg border border-brand-primary/10">
          <h3 className="text-lg font-semibold text-brand-primary/70">Pending Orders</h3>
          <p className="text-3xl font-bold text-brand-accent">{stats?.pendingOrders || 0}</p>
        </div>
        <div className="bg-brand-light p-6 rounded-lg border border-brand-primary/10">
          <h3 className="text-lg font-semibold text-brand-primary/70">Total Users</h3>
          <p className="text-3xl font-bold text-brand-accent">{stats?.totalUsers || 0}</p>
        </div>
        <div className="bg-brand-light p-6 rounded-lg border border-brand-primary/10">
          <h3 className="text-lg font-semibold text-brand-primary/70">Total Orders</h3>
          <p className="text-3xl font-bold text-brand-accent">{stats?.totalOrders || 0}</p>
        </div>
      </div>
      <p className="text-brand-primary/70">Select a section from the sidebar to manage your bakery.</p>
    </div>
  );
};

export default AdminDashboard;