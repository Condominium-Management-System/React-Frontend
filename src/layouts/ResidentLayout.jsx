// src/layouts/ResidentLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/axiosConfig';

const ResidentLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('ha_theme') === 'dark';
  });

  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ha_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ha_theme', 'light');
    }
  }, [isDarkMode]);

  // Fetch authoritative unread alerts count
  const fetchAlertsCount = async () => {
    try {
      const res = await api.announcements.getUnreadCount();
      const count = res.data?.data?.unreadCount ?? res.data?.unreadCount ?? 0;
      setUnreadAlerts(count);
    } catch (e) {
      console.error('Error fetching unread count:', e);
    }
  };

  useEffect(() => {
    fetchAlertsCount();

    const handleReadEvent = (e) => {
      if (typeof e.detail?.unreadCount === 'number') {
        setUnreadAlerts(e.detail.unreadCount);
      } else {
        fetchAlertsCount();
      }
    };

    window.addEventListener('ha_announcements_read', handleReadEvent);
    return () => {
      window.removeEventListener('ha_announcements_read', handleReadEvent);
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdminUser = user?.role === 'condo_admin' || user?.role === 'super_admin';
  const adminDashboardPath = user?.role === 'super_admin' ? '/super-admin/dashboard' : '/condo-admin/dashboard';
  const isGuardUser = user?.role === 'guard';

  // Dynamic header information
  const getHeaderInfo = () => {
    const path = location.pathname;
    if (path.includes('/resident/payments')) return { title: 'Payments', showBack: true };
    if (path.includes('/resident/lost-found')) return { title: 'Lost & Found', showBack: true };
    if (path.includes('/resident/promotions')) return { title: 'Promotions', showBack: true };
    if (path.includes('/resident/announcements')) return { title: 'Alerts & Notices', showBack: true };
    if (path.includes('/resident/reports')) return { title: 'My Reports', showBack: true };
    if (path.includes('/resident/equb')) return { title: 'Community Equb', showBack: true };
    if (path.includes('/resident/iddir')) return { title: 'Resident Iddir', showBack: true };
    if (path.includes('/resident/accounts')) return { title: 'Payout Destination Accounts', showBack: true };
    if (path.includes('/resident/profile')) return { title: 'My Profile', showBack: true };
    return { title: 'HomeAxis', showBack: false };
  };

  const { title: currentTitle, showBack } = getHeaderInfo();

  const isTabActive = (tabPath) => {
    return location.pathname === tabPath;
  };

  // Top desktop navigation links
  const desktopNavLinks = [
    { label: 'Home', path: '/resident/dashboard', icon: 'fa-house' },
    { label: 'Payments', path: '/resident/payments', icon: 'fa-wallet' },
    { label: 'Lost & Found', path: '/resident/lost-found', icon: 'fa-box-archive' },
    { label: 'Promotions', path: '/resident/promotions', icon: 'fa-tags' },
    { label: 'Alerts', path: '/resident/announcements', icon: 'fa-bullhorn', badge: unreadAlerts },
    { label: 'Reports', path: '/resident/reports', icon: 'fa-clipboard-list' },
    { label: 'Equb', path: '/resident/equb', icon: 'fa-piggy-bank' },
    { label: 'Iddir', path: '/resident/iddir', icon: 'fa-hand-holding-heart' },
  ];

  // Mobile Bottom Navigation Tabs (5 core items requested)
  const mobileBottomTabs = [
    { label: 'Home', path: '/resident/dashboard', icon: 'fa-house' },
    { label: 'Payments', path: '/resident/payments', icon: 'fa-wallet' },
    { label: 'Lost & Found', path: '/resident/lost-found', icon: 'fa-box-archive' },
    { label: 'Promotions', path: '/resident/promotions', icon: 'fa-tags' },
    { label: 'Alerts', path: '/resident/announcements', icon: 'fa-bullhorn', badge: unreadAlerts },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-800 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
      {/* GLOBAL HEADER */}
      <header className="sticky top-0 z-40 bg-amber-400 dark:bg-amber-500 text-black shadow-md transition-colors duration-200">
        <div className="w-full px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          
          {/* Left: Brand, Condo Pill & Mobile Back Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {showBack && (
              <button 
                onClick={() => navigate(-1)} 
                className="md:hidden text-black hover:bg-black/10 active:scale-95 rounded-full w-8 h-8 flex items-center justify-center transition border-none bg-transparent cursor-pointer"
                title="Go Back"
              >
                <i className="fa-solid fa-chevron-left text-base"></i>
              </button>
            )}

            <div 
              onClick={() => navigate('/resident/dashboard')}
              className="flex items-center space-x-2 cursor-pointer select-none active:scale-95 transition-transform"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black text-amber-400 flex items-center justify-center shadow-sm">
                <i className="fa-solid fa-building-user text-base sm:text-lg"></i>
              </div>
              <div>
                <h1 className="font-extrabold text-sm sm:text-base md:text-lg leading-tight tracking-tight text-black m-0 p-0 flex items-center gap-1.5">
                  <span>HomeAxis</span>
                  <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-wider bg-black/15 text-black px-2 py-0.2 rounded-full">
                    Resident
                  </span>
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/75 m-0 p-0 hidden sm:block">
                  {user?.condo?.condoName || user?.condoCode || 'Condominium'}
                  {user?.roomNo ? ` • Unit ${user.roomNo}` : ''}
                </p>
              </div>
            </div>

            {/* Mobile Dynamic Page Title Indicator */}
            <div className="md:hidden flex items-center pl-2 border-l border-black/15">
              <span className="font-bold text-xs sm:text-sm text-black truncate max-w-[120px] sm:max-w-[160px]">
                {currentTitle !== 'HomeAxis' ? currentTitle : (user?.condo?.condoName || 'Community')}
              </span>
            </div>
          </div>

          {/* Center: Desktop Navigation Bar (md:flex) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            {desktopNavLinks.map((item) => {
              const active = isTabActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center space-x-1.5 border-none cursor-pointer relative active:scale-95 ${
                    active
                      ? 'bg-black text-amber-400 shadow-sm'
                      : 'bg-transparent text-black hover:bg-black/10'
                  }`}
                >
                  <i className={`fa-solid ${item.icon} text-xs`}></i>
                  <span>{item.label}</span>
                  {item.badge > 0 && !active && (
                    <span className="bg-red-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Admin Switch Back Button (condo_admin / super_admin) */}
            {isAdminUser && (
              <button 
                onClick={() => navigate(adminDashboardPath)}
                className="bg-black text-amber-400 hover:bg-zinc-900 active:scale-95 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-black flex items-center space-x-1.5 shadow transition border-none cursor-pointer"
                title="Return to Administration Dashboard"
              >
                <i className="fa-solid fa-user-shield text-xs"></i>
                <span className="hidden sm:inline">Admin View</span>
              </button>
            )}

            {/* Guard return button (if guard) */}
            {isGuardUser && (
              <button 
                onClick={() => navigate('/guard/dashboard')}
                className="bg-black text-amber-400 hover:bg-zinc-900 active:scale-95 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-black flex items-center space-x-1.5 shadow transition border-none cursor-pointer"
                title="Return to Guard Dashboard"
              >
                <i className="fa-solid fa-shield-halved text-xs"></i>
                <span className="hidden sm:inline">Guard View</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className="bg-black/10 hover:bg-black/20 active:scale-95 text-black p-1.5 sm:px-2.5 sm:py-1.5 rounded-full flex items-center space-x-1 transition text-xs font-bold border-none cursor-pointer"
              title="Toggle Dark/Light Mode"
            >
              <i className={isDarkMode ? "fa-solid fa-sun text-xs" : "fa-solid fa-moon text-xs"}></i>
              <span className="text-[10px] uppercase font-bold hidden sm:inline">{isDarkMode ? "Light" : "Dark"}</span>
            </button>

            {/* Notification / Alerts Icon (Desktop & Mobile) */}
            <button 
              onClick={() => navigate('/resident/announcements')} 
              className="relative p-1.5 sm:p-2 text-black hover:bg-black/10 active:scale-95 rounded-full transition border-none bg-transparent cursor-pointer"
              title="Community Alerts & Bulletins"
            >
              <i className="fa-solid fa-bell text-sm sm:text-base"></i>
              {unreadAlerts > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-red-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-amber-400 dark:border-amber-500 animate-pulse">
                  {unreadAlerts}
                </span>
              )}
            </button>

            {/* Mobile "More" Drawer Trigger / Profile Button */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1 rounded-full text-black hover:bg-black/10 active:scale-95 transition border-none bg-transparent cursor-pointer flex items-center"
              title="More Services & Menu"
            >
              <div className="w-7 h-7 rounded-full bg-black text-amber-400 flex items-center justify-center font-bold text-xs shadow-sm">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <i className="fa-solid fa-bars text-[11px]"></i>}
              </div>
            </button>

            {/* Desktop Profile Link */}
            <button 
              onClick={() => navigate('/resident/profile')} 
              className="hidden md:flex items-center space-x-1.5 p-1 rounded-full text-black hover:bg-black/10 active:scale-95 transition border-none bg-transparent cursor-pointer"
              title="My Account Profile"
            >
              <div className="w-8 h-8 rounded-full bg-black text-amber-400 flex items-center justify-center font-bold text-xs shadow-sm">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <i className="fa-solid fa-user"></i>}
              </div>
              <span className="text-xs font-bold text-black max-w-[100px] truncate hidden lg:inline">
                {user?.fullName?.split(' ')[0] || 'Resident'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN RESPONSIVE CONTENT AREA */}
      {/* Fluid full-width viewport usage, readable padding, with bottom nav safe-area */}
      <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 sm:pb-32 md:pb-10 transition-colors duration-200">
        <Outlet />
      </main>

      {/* MOBILE FIXED BOTTOM NAVIGATION BAR (< md screens) */}
      <nav 
        id="mobile-bottom-nav" 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-gray-200 dark:border-zinc-800 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-1 py-1.5 flex justify-around items-center transition-colors duration-200"
        style={{ paddingBottom: 'calc(0.4rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {mobileBottomTabs.map((tab) => {
          const active = isTabActive(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all duration-200 border-none bg-transparent cursor-pointer relative active:scale-90 ${
                active 
                  ? 'text-amber-500 font-extrabold scale-105' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-amber-500'
              }`}
            >
              <div className="relative">
                <i className={`fa-solid ${tab.icon} text-lg ${active ? 'text-amber-500' : ''}`}></i>
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-zinc-900">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${active ? 'text-amber-500 font-extrabold' : 'text-gray-500 dark:text-gray-400'}`}>
                {tab.label}
              </span>
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-0.5"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* MOBILE "MORE SERVICES & PROFILE" SLIDE-OVER DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end backdrop-blur-sm bg-black/60 md:hidden animate-fade-in">
          {/* Backdrop click to close */}
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>

          {/* Drawer container */}
          <div className="w-4/5 max-w-xs bg-white dark:bg-zinc-900 h-full shadow-2xl p-5 flex flex-col justify-between border-l border-gray-200 dark:border-zinc-800 overflow-y-auto">
            <div className="space-y-5">
              {/* Drawer Header with User Profile */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold text-base shadow">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'AB'}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 dark:text-white m-0 truncate max-w-[130px]">
                      {user?.fullName || 'Resident Member'}
                    </h4>
                    <p className="text-[11px] text-gray-400 m-0">
                      Block {user?.block || 'A'} • Unit {user?.roomNo || '101'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-black dark:hover:text-white flex items-center justify-center border-none cursor-pointer"
                >
                  <i className="fa-solid fa-xmark text-sm"></i>
                </button>
              </div>

              {/* Resident Secondary Modules */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block px-2 mb-1.5">
                  Community Services
                </span>

                <button
                  onClick={() => navigate('/resident/reports')}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-left border-none bg-transparent cursor-pointer text-gray-800 dark:text-gray-200 transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm">
                    <i className="fa-solid fa-clipboard-list"></i>
                  </div>
                  <span className="text-xs font-bold">Maintenance Reports</span>
                </button>

                <button
                  onClick={() => navigate('/resident/equb')}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-left border-none bg-transparent cursor-pointer text-gray-800 dark:text-gray-200 transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm">
                    <i className="fa-solid fa-piggy-bank"></i>
                  </div>
                  <span className="text-xs font-bold">Community Equb (Savings)</span>
                </button>

                <button
                  onClick={() => navigate('/resident/iddir')}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-left border-none bg-transparent cursor-pointer text-gray-800 dark:text-gray-200 transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center text-sm">
                    <i className="fa-solid fa-hand-holding-heart"></i>
                  </div>
                  <span className="text-xs font-bold">Resident Iddir Fund</span>
                </button>

                
                <button
                  onClick={() => navigate('/resident/accounts')}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-left border-none bg-transparent cursor-pointer text-gray-800 dark:text-gray-200 transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
                    <i className="fa-solid fa-wallet"></i>
                  </div>
                  <span className="text-xs font-bold">Bank & Payout Accounts</span>
                </button>
                <button
                  onClick={() => navigate('/resident/profile')}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-left border-none bg-transparent cursor-pointer text-gray-800 dark:text-gray-200 transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm">
                    <i className="fa-solid fa-user-gear"></i>
                  </div>
                  <span className="text-xs font-bold">Profile & Account Settings</span>
                </button>
              </div>

              {/* Admin Switcher (If Applicable) */}
              {isAdminUser && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block px-2 mb-1.5">
                    Management Access
                  </span>
                  <button
                    onClick={() => navigate(adminDashboardPath)}
                    className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold p-3 rounded-xl text-xs flex items-center justify-between shadow border-none cursor-pointer active:scale-95 transition"
                  >
                    <span className="flex items-center space-x-2">
                      <i className="fa-solid fa-user-shield text-sm"></i>
                      <span>Switch to Admin Console</span>
                    </span>
                    <i className="fa-solid fa-chevron-right text-xs"></i>
                  </button>
                </div>
              )}
            </div>

            {/* Drawer Footer: Theme & Sign Out */}
            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-2">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-xs font-bold text-gray-700 dark:text-gray-300 border-none cursor-pointer"
              >
                <span className="flex items-center space-x-2">
                  <i className={isDarkMode ? "fa-solid fa-sun text-amber-500" : "fa-solid fa-moon text-amber-500"}></i>
                  <span>Theme: {isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-gray-400">Toggle</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold border-none cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/40 transition"
              >
                <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentLayout;