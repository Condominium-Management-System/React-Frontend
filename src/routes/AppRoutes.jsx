// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Login from '../pages/auth/Login';
import SuperAdminLayout from '../layouts/SuperAdminLayout';
import CondoAdminLayout from '../layouts/CondoAdminLayout';
import ResidentLayout from '../layouts/ResidentLayout';

// Common Entity Pages (Blocks & Rooms)
import Blocks from '../pages/common/Blocks';
import Rooms from '../pages/common/Rooms';

// Super Admin Pages
import SuperAdminDashboard from '../pages/super-admin/Dashboard';
import Condos from '../pages/super-admin/Condos';
import Users from '../pages/super-admin/Users';
import Reports from '../pages/super-admin/Reports';
import Promotions from '../pages/super-admin/Promotions';
import Announcements from '../pages/super-admin/Announcements';
import EqubIddirManagement from '../pages/super-admin/EqubIddirManagement';
import SuperAdminPayments from '../pages/super-admin/Payments';
import SuperAdminLostFound from '../pages/super-admin/LostFound';

// Condo Admin Pages
import CondoAdminDashboard from '../pages/condo-admin/Dashboard';
import Residents from '../pages/condo-admin/Residents';
import BlocksAndRooms from '../pages/condo-admin/BlocksAndRooms';
import CondoReports from '../pages/condo-admin/Reports';
import CondoPayments from '../pages/condo-admin/Payments';
import LostFound from '../pages/condo-admin/LostFound';
import CondoAnnouncements from '../pages/condo-admin/Announcements';
import CondoPromotions from '../pages/condo-admin/Promotions';
import EqubManagement from '../pages/condo-admin/EqubManagement';
import IddirManagement from '../pages/condo-admin/IddirManagement';
import CondoAccounts from '../pages/condo-admin/Accounts';
import SuperAdminAccounts from '../pages/super-admin/Accounts';

// Resident Pages
import ResidentDashboard from '../pages/resident/Dashboard';
import ResidentAnnouncements from '../pages/resident/Announcements';
import ResidentLostFound from '../pages/resident/LostFound';
import ResidentReports from '../pages/resident/Reports';
import ResidentPromotions from '../pages/resident/Promotions';
import ResidentPayments from '../pages/resident/Payments';
import ResidentEqub from '../pages/resident/Equb';
import ResidentIddir from '../pages/resident/Iddir';
import ResidentProfile from '../pages/resident/Profile';
import ResidentAccounts from '../pages/resident/Accounts';

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

  // Common Resident Routes block (accessible by residents, guards, and admins)
  const residentRoutes = (
    <Route path="/resident" element={<ResidentLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<ResidentDashboard />} />
      <Route path="payments" element={<ResidentPayments />} />
      <Route path="payments/:id" element={<ResidentPayments />} />
      <Route path="lost-found" element={<ResidentLostFound />} />
      <Route path="promotions" element={<ResidentPromotions />} />
      <Route path="promotions/:id" element={<ResidentPromotions />} />
      <Route path="announcements" element={<ResidentAnnouncements />} />
      <Route path="announcements/:id" element={<ResidentAnnouncements />} />
      <Route path="reports" element={<ResidentReports />} />
      <Route path="reports/:id" element={<ResidentReports />} />
      <Route path="equb" element={<ResidentEqub />} />
      <Route path="equb/:id" element={<ResidentEqub />} />
      <Route path="iddir" element={<ResidentIddir />} />
      <Route path="iddir/:id" element={<ResidentIddir />} />
      <Route path="profile" element={<ResidentProfile />} />
      <Route path="accounts" element={<ResidentAccounts />} />
    </Route>
  );

  // Super Admin Routes
  if (user.role === 'super_admin') {
    return (
      <Routes>
        <Route path="/login" element={<Navigate to="/super-admin/dashboard" replace />} />
        <Route path="/super-admin" element={<SuperAdminLayout />}>
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="condos" element={<Condos />} />
          <Route path="blocks" element={<Blocks />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="users" element={<Users />} />
          <Route path="reports" element={<Reports />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="lost-found" element={<SuperAdminLostFound />} />
          <Route path="payments" element={<SuperAdminPayments />} />
          <Route path="equbs" element={<EqubManagement />} />
          <Route path="iddirs" element={<IddirManagement />} />
          <Route path="accounts" element={<SuperAdminAccounts />} />
          <Route path="equb-iddir" element={<EqubIddirManagement />} />
        </Route>
        {residentRoutes}
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
          <Route path="blocks" element={<Blocks />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="residents" element={<Residents />} />
          <Route path="units" element={<BlocksAndRooms />} />
          <Route path="reports" element={<CondoReports />} />
          <Route path="payments" element={<CondoPayments />} />
          <Route path="accounts" element={<CondoAccounts />} />
          <Route path="announcements" element={<CondoAnnouncements />} />
          <Route path="promotions" element={<CondoPromotions />} />
          <Route path="lost-found" element={<LostFound />} />
          <Route path="equbs" element={<EqubManagement />} />
          <Route path="iddirs" element={<IddirManagement />} />
        </Route>
        {residentRoutes}
        <Route path="*" element={<Navigate to="/condo-admin/dashboard" replace />} />
      </Routes>
    );
  }

  // Resident & Guard Routes (Residents can NEVER access admin routes)
  if (user.role === 'resident' || user.role === 'guard') {
    return (
      <Routes>
        <Route path="/login" element={<Navigate to="/resident/dashboard" replace />} />
        {residentRoutes}
        <Route path="*" element={<Navigate to="/resident/dashboard" replace />} />
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
