import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminRoute = ({ children }) => {
  const { isAdminAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Checking admin access...</div>
      </div>
    );
  }

  return isAdminAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

export default AdminRoute;