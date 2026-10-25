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

const Sidebar = ({ isSuperAdmin, isResident, onLogout }) => {
  const superAdminLinks = [
    { path: '/super-admin/dashboard', icon: Dashboard, label: 'Dashboard' },
    { path: '/super-admin/condos', icon: Apartment, label: 'Condominiums' },
    { path: '/super-admin/blocks', icon: Domain, label: 'Blocks' },
    { path: '/super-admin/rooms', icon: MeetingRoom, label: 'Rooms' },
    { path: '/super-admin/users', icon: People, label: 'Users' },
    { path: '/super-admin/reports', icon: Report, label: 'Reports' },
    { path: '/super-admin/payments', icon: Payment, label: 'Payments' },
    { path: '/super-admin/accounts', icon: AccountBalance, label: 'Condo Accounts' },
    { path: '/super-admin/announcements', icon: Announcement, label: 'Announcements' },
    { path: '/super-admin/promotions', icon: Storefront, label: 'Promotions' },
    { path: '/super-admin/lost-found', icon: Search, label: 'Lost & Found' },
    { path: '/super-admin/equbs', icon: AccountBalance, label: 'Equb Management' },
    { path: '/super-admin/iddirs', icon: Shield, label: 'Iddir Management' },
    { path: '/super-admin/equb-iddir', icon: AccountBalance, label: 'Equb & Iddir Hub' },
    { path: '/resident/dashboard', icon: People, label: 'Resident View' },
  ];

  const condoAdminLinks = [
    { path: '/condo-admin/dashboard', icon: Dashboard, label: 'Dashboard' },
    { path: '/condo-admin/blocks', icon: Domain, label: 'Blocks' },
    { path: '/condo-admin/rooms', icon: MeetingRoom, label: 'Rooms' },
    { path: '/condo-admin/residents', icon: People, label: 'Residents' },
    { path: '/condo-admin/reports', icon: Report, label: 'Reports' },
    { path: '/condo-admin/payments', icon: Payment, label: 'Payments' },
    { path: '/condo-admin/accounts', icon: AccountBalance, label: 'Condo Accounts' },
    { path: '/condo-admin/announcements', icon: Announcement, label: 'Announcements' },
    { path: '/condo-admin/promotions', icon: Storefront, label: 'Promotions' },
    { path: '/condo-admin/lost-found', icon: Search, label: 'Lost & Found' },
    { path: '/condo-admin/equbs', icon: AccountBalance, label: 'Equb Management' },
    { path: '/condo-admin/iddirs', icon: Shield, label: 'Iddir Management' },
    { path: '/resident/dashboard', icon: People, label: 'Resident View' },
  ];

  const residentLinks = [
    { path: '/resident/dashboard', icon: Dashboard, label: 'Dashboard' },
    { path: '/resident/announcements', icon: Announcement, label: 'Announcements' },
    { path: '/resident/lost-found', icon: Search, label: 'Lost & Found' },
    { path: '/resident/reports', icon: Report, label: 'My Reports' },
    { path: '/resident/promotions', icon: Storefront, label: 'Promotions' },
  ];

  const links = isSuperAdmin ? superAdminLinks : (isResident ? residentLinks : condoAdminLinks);

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
