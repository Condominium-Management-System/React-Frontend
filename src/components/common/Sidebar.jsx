// src/components/common/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Dashboard,
  Apartment,
  People,
  Payment,
  Announcement,
  Report,
  Search,
  Storefront,
  Logout,
  AccountBalance,
  Shield,
  MeetingRoom,
  Domain,
} from '@mui/icons-material';

const Sidebar = ({ isSuperAdmin, onLogout }) => {
  const superAdminLinks = [
    { path: '/super-admin/dashboard', icon: Dashboard, label: 'Dashboard' },
    { path: '/super-admin/condos', icon: Apartment, label: 'Condominiums' },
    { path: '/super-admin/blocks', icon: Domain, label: 'Blocks' },
    { path: '/super-admin/rooms', icon: MeetingRoom, label: 'Rooms' },
    { path: '/super-admin/users', icon: People, label: 'Users' },
    { path: '/super-admin/reports', icon: Report, label: 'Reports' },
    { path: '/super-admin/payments', icon: Payment, label: 'Payments' },
    { path: '/super-admin/announcements', icon: Announcement, label: 'Announcements' },
    { path: '/super-admin/promotions', icon: Storefront, label: 'Promotions' },
    { path: '/super-admin/equb-iddir', icon: AccountBalance, label: 'Equb & Iddir' },
  ];

  const condoAdminLinks = [
    { path: '/condo-admin/dashboard', icon: Dashboard, label: 'Dashboard' },
    { path: '/condo-admin/blocks', icon: Domain, label: 'Blocks' },
    { path: '/condo-admin/rooms', icon: MeetingRoom, label: 'Rooms' },
    { path: '/condo-admin/residents', icon: People, label: 'Residents' },
    { path: '/condo-admin/reports', icon: Report, label: 'Reports' },
    { path: '/condo-admin/payments', icon: Payment, label: 'Payments' },
    { path: '/condo-admin/announcements', icon: Announcement, label: 'Announcements' },
    { path: '/condo-admin/lost-found', icon: Search, label: 'Lost & Found' },
    { path: '/condo-admin/equbs', icon: AccountBalance, label: 'Equb Management' },
    { path: '/condo-admin/iddirs', icon: Shield, label: 'Iddir Management' },
  ];

  const links = isSuperAdmin ? superAdminLinks : condoAdminLinks;

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <span>🏢</span>
        <span>Home Axis</span>
      </div>
      
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <link.icon className="sidebar-icon" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <button onClick={onLogout} className="sidebar-logout">
        <Logout className="sidebar-icon" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
