// src/layouts/SuperAdminLayout.jsx
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/common/Sidebar';

const SuperAdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <Sidebar isSuperAdmin={true} onLogout={handleLogout} />
      <div className="main-content">
        <div className="main-header">
          <h2>Super Admin Console</h2>
          <div className="user-info">
            <span>{user?.fullName || 'Super Admin'}</span>
            <div className="avatar">SA</div>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default SuperAdminLayout;