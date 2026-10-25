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
          <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate('/resident/dashboard')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #e2b13c 0%, #f59e0b 100%)',
                color: '#000',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '20px',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(226, 177, 60, 0.35)',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              title="Switch to Resident Portal"
            >
              <span>🏠</span>
              <span>Resident View</span>
            </button>
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