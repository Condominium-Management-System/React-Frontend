// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Login from '../pages/auth/Login';
import SuperAdminLayout from '../layouts/SuperAdminLayout';
import CondoAdminLayout from '../layouts/CondoAdminLayout';

// Super Admin Pages
import SuperAdminDashboard from '../pages/super-admin/Dashboard';
import Condos from '../pages/super-admin/Condos';
import Users from '../pages/super-admin/Users';
import Reports from '../pages/super-admin/Reports';
import Promotions from '../pages/super-admin/Promotions';
import Announcements from '../pages/super-admin/Announcements';
import EqubIddirManagement from '../pages/super-admin/EqubIddirManagement';
import SuperAdminPayments from '../pages/super-admin/Payments';

// Condo Admin Pages
import CondoAdminDashboard from '../pages/condo-admin/Dashboard';
import Residents from '../pages/condo-admin/Residents';
import CondoReports from '../pages/condo-admin/Reports';
import CondoPayments from '../pages/condo-admin/Payments';
import LostFound from '../pages/condo-admin/LostFound';
import CondoAnnouncements from '../pages/condo-admin/Announcements';
import EqubManagement from '../pages/condo-admin/EqubManagement';
import IddirManagement from '../pages/condo-admin/IddirManagement';


import './AppRoutes.css';

const AppRoutes = () => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return <div>Loading...</div>;
  }

  // If not authenticated, only show login
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If authenticated but no user, redirect to login
  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Super Admin Routes
  if (user.role === 'super_admin') {
    return (
      <Routes>
        <Route path="/login" element={<Navigate to="/super-admin/dashboard" replace />} />
        <Route path="/super-admin" element={<SuperAdminLayout />}>
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="condos" element={<Condos />} />
          <Route path="users" element={<Users />} />
          <Route path="reports" element={<Reports />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="payments" element={<SuperAdminPayments />} />
          <Route path="equb-iddir" element={<EqubIddirManagement />} />
        </Route>
        <Route path="*" element={<Navigate to="/super-admin/dashboard" replace />} />
      </Routes>
    );
  }

  // Condo Admin Routes
  if (user.role === 'condo_admin') {
    return (
      <Routes>
        <Route path="/login" element={<Navigate to="/condo-admin/dashboard" replace />} />
        <Route path="/condo-admin" element={<CondoAdminLayout />}>
          <Route path="dashboard" element={<CondoAdminDashboard />} />
          <Route path="residents" element={<Residents />} />
          <Route path="reports" element={<CondoReports />} />
          <Route path="payments" element={<CondoPayments />} />
          <Route path="lost-found" element={<LostFound />} />
          <Route path="announcements" element={<CondoAnnouncements />} />
          <Route path="equbs" element={<EqubManagement />} />
<Route path="iddirs" element={<IddirManagement />} />
        </Route>
        <Route path="*" element={<Navigate to="/condo-admin/dashboard" replace />} />
      </Routes>
    );
  }

  // Fallback for other roles
  return (
    <Routes>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;