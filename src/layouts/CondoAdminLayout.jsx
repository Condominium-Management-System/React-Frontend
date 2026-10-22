import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/common/Sidebar';

const CondoAdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has condoId
    if (user && !user.condoId) {
      console.warn('⚠️ Condo Admin user has no condoId assigned!');
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <Sidebar isSuperAdmin={false} onLogout={handleLogout} />
      <div className="main-content">
        <div className="main-header">
          <h2>{user?.condoCode || 'Condo Admin'} Console</h2>
          <div className="user-info">
            <span>{user?.fullName || 'Condo Admin'}</span>
            <div className="avatar">CA</div>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default CondoAdminLayout;