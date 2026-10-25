// src/pages/resident/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axiosConfig';

const ResidentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [lostFoundCount, setLostFoundCount] = useState(0);
  const [newLostFoundToday, setNewLostFoundToday] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);
  const [openReportsCount, setOpenReportsCount] = useState(0);
  
  // Interactive Announcement Modal
  const [selectedNotice, setSelectedNotice] = useState(null);
  // Payment Detail Modal
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [profileRes, annRes, payRes, lfRes, repRes] = await Promise.allSettled([
        api.users.getMyFullProfile().catch(() => ({ data: { data: null } })),
        api.announcements.getAll({ limit: 6 }).catch(() => ({ data: { data: [] } })),
        api.payments.getMy({ limit: 10 }).catch(() => ({ data: { data: [] } })),
        api.lostFound.getAll({ limit: 50 }).catch(() => ({ data: { data: [] } })),
        api.reports.getMy().catch(() => ({ data: { data: [] } }))
      ]);

      // Profile & Authoritative Financial Totals
      if (profileRes.status === 'fulfilled' && profileRes.value?.data?.data) {
        setProfileData(profileRes.value.data.data);
      }

      // Announcements
      if (annRes.status === 'fulfilled') {
        const resData = annRes.value?.data?.data || annRes.value?.data;
        const annList = resData?.items || resData?.announcements || (Array.isArray(resData) ? resData : []);
        setAnnouncements(annList.slice(0, 4));
      }

      // Payments
      if (payRes.status === 'fulfilled') {
        const resData = payRes.value?.data?.data || payRes.value?.data;
        const payList = resData?.payments || resData?.items || (Array.isArray(resData) ? resData : []);
        setRecentPayments(payList.slice(0, 3));
      }

      // Lost & Found
      if (lfRes.status === 'fulfilled') {
        const lfList = lfRes.value?.data?.data?.items || lfRes.value?.data?.data || lfRes.value?.data || [];
        if (Array.isArray(lfList)) {
          setLostFoundCount(lfList.length);
          const todayStr = new Date().toISOString().slice(0, 10);
          const todayCount = lfList.filter(item => item.createdAt && item.createdAt.startsWith(todayStr)).length;
          setNewLostFoundToday(todayCount);
        }
      }

      // Reports
      if (repRes.status === 'fulfilled') {
        const repList = repRes.value?.data?.data?.items || repRes.value?.data?.data || repRes.value?.data || [];
        if (Array.isArray(repList)) {
          setReportsCount(repList.length);
          const openCount = repList.filter(r => r.status !== 'resolved' && r.status !== 'closed').length;
          setOpenReportsCount(openCount);
        }
      }
    } catch (err) {
      console.error('Error loading resident dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen for live refresh events across tabs or modals
    const handleRefresh = () => fetchDashboardData();
    window.addEventListener('ha_payment_submitted', handleRefresh);
    window.addEventListener('ha_account_updated', handleRefresh);
    window.addEventListener('ha_membership_updated', handleRefresh);

    return () => {
      window.removeEventListener('ha_payment_submitted', handleRefresh);
      window.removeEventListener('ha_account_updated', handleRefresh);
      window.removeEventListener('ha_membership_updated', handleRefresh);
    };
  }, []);

  // Visual service cards
  const services = [
    { label: 'Payments', desc: 'Dues & receipts', icon: 'fa-wallet', path: '/resident/payments', bg: 'bg-amber-400/15', color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Lost & Found', desc: 'Items & chat', icon: 'fa-box-archive', path: '/resident/lost-found', bg: 'bg-orange-500/15', color: 'text-orange-600 dark:text-orange-400' },
    { label: 'Promotions', desc: 'Partner perks', icon: 'fa-tags', path: '/resident/promotions', bg: 'bg-emerald-500/15', color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Reports', desc: 'Maintenance', icon: 'fa-clipboard-list', path: '/resident/reports', bg: 'bg-purple-500/15', color: 'text-purple-600 dark:text-purple-400' },
    { label: 'Equb', desc: 'Rotating pot', icon: 'fa-piggy-bank', path: '/resident/equb', bg: 'bg-blue-500/15', color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Iddir', desc: 'Support fund', icon: 'fa-hand-holding-heart', path: '/resident/iddir', bg: 'bg-rose-500/15', color: 'text-rose-600 dark:text-rose-400' },
  ];

  // Authoritative extraction from unified backend profile response
  const financialSummary = profileData?.financialSummary || {};
  const totalVerified = financialSummary.totalPaidVerified ?? profileData?.totalPaidVerified ?? 0;
  const hasPaidThisMonth = financialSummary.hasPaidThisMonth ?? profileData?.hasPaidThisMonth ?? false;
  const totalPending = financialSummary.totalPending ?? profileData?.totalPending ?? 0;

  // Destination Bank & Mobile Money Accounts
  const accountsList = profileData?.accounts || profileData?.bankAccounts || [];
  const defaultAccount = accountsList.find(a => a.isDefault && a.status === 'active') || accountsList.find(a => a.status === 'active') || accountsList[0];

  // Equb Memberships & Verified Totals
  const equbMemberships = profileData?.memberships?.equb || profileData?.equbMemberships || [];
  const activeEqub = equbMemberships.find(m => m.status === 'active' || m.status === 'winner');
  const pendingEqub = equbMemberships.find(m => m.status === 'pending');
  const rejectedEqub = equbMemberships.find(m => m.status === 'rejected');
  const equbVerifiedTotal = financialSummary.equbVerifiedTotal ?? profileData?.equbVerifiedTotal ?? 0;

  // Iddir Memberships & Verified Totals
  const iddirMemberships = profileData?.memberships?.iddir || profileData?.iddirMemberships || [];
  const activeIddir = iddirMemberships.find(m => m.status === 'active');
  const pendingIddir = iddirMemberships.find(m => m.status === 'pending');
  const rejectedIddir = iddirMemberships.find(m => m.status === 'rejected');
  const iddirVerifiedTotal = financialSummary.iddirVerifiedTotal ?? profileData?.iddirVerifiedTotal ?? 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      
      {/* 1. COMPACT & CLEAN WELCOME HERO BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-black shadow-lg">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-black/15 text-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <i className="fa-solid fa-building text-[10px]"></i>
                <span>{user?.condo?.condoName || user?.condoCode || 'HomeAxis Community'}</span>
              </span>
              <span className="text-[10px] sm:text-xs font-bold bg-white/30 text-black px-2 py-0.5 rounded-full">
                Unit: {user?.block ? `Blk ${user.block}` : ''} {user?.roomNo ? `Room ${user.roomNo}` : ''}
              </span>
            </div>

            <h2 className="text-xl sm:text-3xl font-black text-black tracking-tight m-0">
              Welcome, {user?.fullName ? user.fullName.split(' ')[0] : 'Resident'}!
            </h2>
            
            <p className="text-xs sm:text-sm text-black/85 max-w-xl font-medium m-0">
              {hasPaidThisMonth
                ? 'Your monthly condominium dues are verified and up to date. Community savings active.'
                : 'Welcome to your resident hub. Stay updated on building maintenance & community dues.'}
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex items-center space-x-2 pt-1 sm:pt-0 shrink-0">
            <button
              onClick={() => navigate('/resident/reports')}
              className="bg-black/80 hover:bg-black active:scale-95 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs shadow transition border-none cursor-pointer flex items-center space-x-1.5"
            >
              <i className="fa-solid fa-wrench text-amber-400 text-xs"></i>
              <span>Report Issue</span>
            </button>
            <button
              onClick={() => navigate('/resident/payments?action=pay')}
              className="bg-black text-amber-400 hover:bg-zinc-900 active:scale-95 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs shadow transition border-none cursor-pointer flex items-center space-x-1.5"
            >
              <i className="fa-solid fa-credit-card text-xs"></i>
              <span>Make Payment</span>
            </button>
          </div>
        </div>

        {/* Ambient Building Watermark */}
        <div className="absolute right-[-15px] bottom-[-25px] text-black/10 text-8xl pointer-events-none select-none hidden sm:block">
          <i className="fa-solid fa-city"></i>
        </div>
      </div>

      {/* 2. COMMUNITY SERVICE SHORTCUTS (Responsive 3-col on mobile, 6-col on desktop) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white uppercase tracking-wider m-0">
            Resident Services
          </h3>
          <span className="text-[11px] text-gray-400 font-medium">Quick access</span>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3.5">
          {services.map((svc) => (
            <button 
              key={svc.label}
              onClick={() => navigate(svc.path)} 
              className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl border border-gray-200/90 dark:border-zinc-800 shadow-sm hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md active:scale-95 transition-all flex flex-col items-center cursor-pointer group text-center"
            >
              <div className={`w-10 h-10 sm:w-11 sm:h-11 ${svc.bg} ${svc.color} rounded-2xl flex items-center justify-center text-lg sm:text-xl mb-1.5 group-hover:scale-110 transition-transform`}>
                <i className={`fa-solid ${svc.icon}`}></i>
              </div>
              <span className="text-xs font-bold text-gray-900 dark:text-white truncate w-full">{svc.label}</span>
              <span className="text-[10px] text-gray-400 mt-0.5 hidden sm:block">{svc.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. RESPONSIVE TWO-COLUMN GRID: MAIN CONTENT & SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        
        {/* LEFT / MAIN COLUMN (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-5 sm:space-y-6">
          
          {/* Authoritative Financial & Activity Summary Cards */}
          <div>
            <h3 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white uppercase tracking-wider mb-2.5 m-0">
              Authoritative Financial & Activity Summary
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
              
              {/* Total Verified Paid */}
              <div 
                onClick={() => navigate('/resident/payments')} 
                className="bg-white dark:bg-zinc-900 p-3.5 sm:p-4 rounded-2xl border border-gray-200/90 dark:border-zinc-800 shadow-sm cursor-pointer hover:border-amber-400 active:scale-95 transition-all flex flex-col justify-between"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-gray-400 font-bold uppercase">Total Verified</span>
                  <i className="fa-solid fa-receipt text-amber-500 text-sm"></i>
                </div>
                <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white m-0">
                  {loading ? '...' : `${totalVerified.toLocaleString()} ETB`}
                </p>
                <span className="text-[10px] font-bold text-green-500 mt-1 flex items-center gap-1">
                  <i className="fa-solid fa-circle-check text-[9px]"></i> Approved dues
                </span>
              </div>

              {/* Monthly Status */}
              <div 
                onClick={() => navigate('/resident/payments')} 
                className="bg-white dark:bg-zinc-900 p-3.5 sm:p-4 rounded-2xl border border-gray-200/90 dark:border-zinc-800 shadow-sm cursor-pointer hover:border-amber-400 active:scale-95 transition-all flex flex-col justify-between"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-gray-400 font-bold uppercase">Monthly Status</span>
                  <i className="fa-solid fa-shield-halved text-amber-500 text-sm"></i>
                </div>
                <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white m-0 truncate">
                  {hasPaidThisMonth ? 'Up to Date' : 'Due Pending'}
                </p>
                <span className={`text-[10px] font-bold mt-1 ${hasPaidThisMonth ? 'text-green-500' : 'text-amber-500'}`}>
                  {hasPaidThisMonth ? 'Current month clear' : 'Tap to pay dues'}
                </span>
              </div>

              {/* Lost & Found */}
              <div 
                onClick={() => navigate('/resident/lost-found')} 
                className="bg-white dark:bg-zinc-900 p-3.5 sm:p-4 rounded-2xl border border-gray-200/90 dark:border-zinc-800 shadow-sm cursor-pointer hover:border-amber-400 active:scale-95 transition-all flex flex-col justify-between"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-gray-400 font-bold uppercase">Lost & Found</span>
                  <i className="fa-solid fa-box-open text-amber-500 text-sm"></i>
                </div>
                <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white m-0">
                  {loading ? '...' : `${lostFoundCount} Items`}
                </p>
                <span className="text-[10px] font-bold text-amber-500 mt-1">
                  {newLostFoundToday > 0 ? `${newLostFoundToday} New today` : 'Community items'}
                </span>
              </div>

              {/* Maintenance Reports */}
              <div 
                onClick={() => navigate('/resident/reports')} 
                className="bg-white dark:bg-zinc-900 p-3.5 sm:p-4 rounded-2xl border border-gray-200/90 dark:border-zinc-800 shadow-sm cursor-pointer hover:border-amber-400 active:scale-95 transition-all flex flex-col justify-between"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-gray-400 font-bold uppercase">My Reports</span>
                  <i className="fa-solid fa-screwdriver-wrench text-amber-500 text-sm"></i>
                </div>
                <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white m-0">
                  {loading ? '...' : `${reportsCount} Filed`}
                </p>
                <span className="text-[10px] font-bold text-purple-500 mt-1">
                  {openReportsCount > 0 ? `${openReportsCount} In Progress` : 'All resolved'}
                </span>
              </div>
            </div>
          </div>

          {/* Community Standing & Payout Destination Strip */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/90 dark:border-zinc-800 p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide flex items-center gap-2">
                <i className="fa-solid fa-landmark text-amber-500"></i>
                <span>Savings & Payout Destination Standing</span>
              </span>
              <button
                onClick={() => navigate('/resident/accounts')}
                className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1"
              >
                <span>Manage Accounts</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Equb Status */}
              <div 
                onClick={() => navigate('/resident/equb')} 
                className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 cursor-pointer hover:border-amber-400 active:scale-98 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Equb Membership</span>
                    <i className="fa-solid fa-piggy-bank text-blue-500"></i>
                  </div>
                  <p className="font-black text-gray-900 dark:text-white m-0 text-sm truncate">
                    {activeEqub ? (activeEqub.equb?.name ? `Active (${activeEqub.equb.name})` : 'Active Participant') : (pendingEqub ? 'Pending Approval' : (rejectedEqub ? 'Request Rejected' : 'Not Enrolled'))}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200/50 dark:border-zinc-700/50">
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-black block">
                    {equbVerifiedTotal.toLocaleString()} ETB verified
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    {activeEqub ? 'Rotating pot active' : (pendingEqub ? 'Awaiting verification' : 'Tap to join an Equb')}
                  </span>
                </div>
              </div>

              {/* Iddir Status */}
              <div 
                onClick={() => navigate('/resident/iddir')} 
                className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 cursor-pointer hover:border-amber-400 active:scale-98 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Iddir Mutual Aid</span>
                    <i className="fa-solid fa-hand-holding-heart text-rose-500"></i>
                  </div>
                  <p className="font-black text-gray-900 dark:text-white m-0 text-sm truncate">
                    {activeIddir ? (activeIddir.iddir?.name ? `Active (${activeIddir.iddir.name})` : 'Protected Member') : (pendingIddir ? 'Pending Approval' : (rejectedIddir ? 'Request Rejected' : 'Not Enrolled'))}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200/50 dark:border-zinc-700/50">
                  <span className="text-xs text-rose-500 font-black block">
                    {iddirVerifiedTotal.toLocaleString()} ETB verified
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    {activeIddir ? 'Bereavement & emergency aid' : (pendingIddir ? 'Awaiting verification' : 'Tap to join an Iddir')}
                  </span>
                </div>
              </div>

              {/* Default Payout Bank */}
              <div 
                onClick={() => navigate('/resident/accounts')} 
                className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 cursor-pointer hover:border-amber-400 active:scale-98 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Payout Destination</span>
                    <i className="fa-solid fa-building-columns text-amber-500"></i>
                  </div>
                  <p className="font-black text-gray-900 dark:text-white m-0 text-sm truncate">
                    {defaultAccount ? `${defaultAccount.providerName || defaultAccount.paymentMethod?.toUpperCase()} (${defaultAccount.maskedAccountNumber || (defaultAccount.accountNumber ? '••••' + defaultAccount.accountNumber.slice(-4) : '••••')})` : 'No Account Set'}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200/50 dark:border-zinc-700/50">
                  <span className={`text-xs font-black block ${defaultAccount ? 'text-green-500' : 'text-amber-500'}`}>
                    {defaultAccount ? 'Ready for draw payouts' : 'Tap to configure'}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    {defaultAccount ? (defaultAccount.isDefault ? 'Default destination' : 'Active destination') : 'No payout destination'}
                  </span>
                </div>
              </div>
            </div>

            {totalPending > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-900/40 p-2.5 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between">
                <span>
                  <i className="fa-solid fa-clock mr-1"></i> You have {totalPending} payment(s) awaiting administrative verification.
                </span>
                <button
                  onClick={() => navigate('/resident/payments')}
                  className="font-bold underline bg-transparent border-none cursor-pointer text-amber-900 dark:text-amber-200"
                >
                  View
                </button>
              </div>
            )}
          </div>

          {/* Recent Payments Preview */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/90 dark:border-zinc-800 p-4 sm:p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white flex items-center space-x-2 m-0">
                <i className="fa-solid fa-receipt text-amber-500"></i>
                <span>Recent Payments & Receipts</span>
              </h3>
              <button 
                onClick={() => navigate('/resident/payments')} 
                className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline bg-transparent border-none cursor-pointer"
              >
                All Payments →
              </button>
            </div>

            {loading ? (
              <div className="py-6 text-center text-xs text-gray-400 animate-pulse">
                Loading transaction history...
              </div>
            ) : recentPayments.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-xs">
                No recent payment transactions recorded.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                {recentPayments.map((p) => (
                  <div 
                    key={p.id} 
                    onClick={() => setSelectedPayment(p)}
                    className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 dark:hover:bg-zinc-800/40 px-2 rounded-xl transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                        <i className="fa-solid fa-receipt"></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white capitalize m-0">
                          {p.paymentType ? p.paymentType.replace('_', ' ') : 'Payment'}
                        </h4>
                        <p className="text-[11px] text-gray-400 m-0">
                          {new Date(p.createdAt).toLocaleDateString()} • {p.paymentMethod?.toUpperCase() || 'CBE'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white m-0">
                        {parseFloat(p.amount).toLocaleString()} ETB
                      </p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        p.status === 'approved' || p.status === 'verified'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                          : p.status === 'rejected'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                      }`}>
                        {p.status === 'approved' || p.status === 'verified'
                          ? 'Verified'
                          : p.status === 'rejected'
                          ? 'Rejected'
                          : 'Pending Verification'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT / SIDEBAR COLUMN (1/3 width on desktop) */}
        <div className="space-y-5 sm:space-y-6">
          
          {/* Community Notices Card (Interactive, click opens notice modal) */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/90 dark:border-zinc-800 p-4 sm:p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white flex items-center space-x-2 m-0">
                <i className="fa-solid fa-bullhorn text-amber-500"></i>
                <span>Community Notices</span>
              </h3>
              <button 
                onClick={() => navigate('/resident/announcements')} 
                className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline bg-transparent border-none cursor-pointer"
              >
                All ({announcements.length}) →
              </button>
            </div>

            <div className="space-y-2.5">
              {loading ? (
                <div className="py-6 text-center text-xs text-gray-400 animate-pulse">
                  Loading bulletins...
                </div>
              ) : announcements.length > 0 ? (
                announcements.map((ann) => {
                  const typeLower = (ann.announcementType || ann.category || '').toLowerCase();
                  const isUrgent = ann.priority === 'emergency' || ann.priority === 'high' || typeLower === 'emergency';
                  return (
                    <div 
                      key={ann.id}
                      onClick={() => {
                        setSelectedNotice(ann);
                        if (!ann.isRead) {
                          api.announcements.markRead(ann.id)
                            .then(res => {
                              const newUnreadCount = res.data?.data?.unreadCount ?? 0;
                              window.dispatchEvent(new CustomEvent('ha_announcements_read', { detail: { unreadCount: newUnreadCount } }));
                            })
                            .catch(() => {});
                        }
                      }}
                      className={`p-3 rounded-xl border cursor-pointer hover:border-amber-400 active:scale-98 transition bg-gray-50/50 dark:bg-zinc-800/40 ${
                        isUrgent ? 'border-red-400/70 dark:border-red-500/60' : 'border-gray-200/80 dark:border-zinc-800'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                        <span className={`font-bold uppercase ${isUrgent ? 'text-red-500' : 'text-amber-600 dark:text-amber-400'}`}>
                          {isUrgent && <i className="fa-solid fa-triangle-exclamation mr-1"></i>}
                          {ann.announcementType || ann.category || 'Announcement'}
                        </span>
                        <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white m-0 line-clamp-1">
                        {ann.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 m-0 leading-relaxed">
                        {ann.body || ann.content || ann.description || 'No description provided.'}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 text-center text-xs text-gray-400">
                  No active notices. Everything is clear!
                </div>
              )}
            </div>
          </div>

          {/* Building Security & Administration Contacts Removed per specification */}
        </div>
      </div>

      {/* INTERACTIVE NOTICE MODAL */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-3.5 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-400">
                  {selectedNotice.announcementType || selectedNotice.category || 'Official Notice'}
                </span>
                <h3 className="font-black text-base sm:text-lg text-gray-900 dark:text-white m-0 mt-1.5">
                  {selectedNotice.title}
                </h3>
                <p className="text-[11px] text-gray-400 m-0 mt-0.5">
                  Published {new Date(selectedNotice.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button 
                onClick={() => setSelectedNotice(null)}
                className="text-gray-400 hover:text-black dark:hover:text-white border-none bg-transparent cursor-pointer p-1"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="border-t border-b border-gray-100 dark:border-zinc-800 py-3.5">
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 m-0 whitespace-pre-wrap leading-relaxed">
                {selectedNotice.body || selectedNotice.content || selectedNotice.description || 'No description provided.'}
              </p>
            </div>

            <button
              onClick={() => setSelectedNotice(null)}
              className="w-full bg-amber-400 hover:bg-amber-500 active:scale-95 text-black font-extrabold p-2.5 rounded-xl text-xs transition border-none cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* PAYMENT DETAIL MODAL */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-2 border-b border-gray-100 dark:border-zinc-800">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  selectedPayment.status === 'approved' || selectedPayment.status === 'verified'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                    : selectedPayment.status === 'rejected'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                }`}>
                  {selectedPayment.status || 'Pending Review'}
                </span>
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white m-0 mt-1 capitalize">
                  {selectedPayment.paymentType?.replace('_', ' ') || 'Payment Details'}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedPayment(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white border-none bg-transparent cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl text-center border border-amber-200 dark:border-amber-900/40">
                <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 block">Amount</span>
                <p className="text-2xl font-black text-gray-900 dark:text-white m-0 mt-0.5">
                  {parseFloat(selectedPayment.amount).toLocaleString()} ETB
                </p>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-zinc-800 text-xs">
                <div className="py-2 flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-bold uppercase text-gray-900 dark:text-white">{selectedPayment.paymentMethod || 'CBE'}</span>
                </div>
                {selectedPayment.referenceNo && (
                  <div className="py-2 flex justify-between">
                    <span className="text-gray-500">Reference No</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">{selectedPayment.referenceNo}</span>
                  </div>
                )}
                <div className="py-2 flex justify-between">
                  <span className="text-gray-500">Submitted</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedPayment.createdAt).toLocaleString()}
                  </span>
                </div>
                {selectedPayment.approvalDate && (
                  <div className="py-2 flex justify-between">
                    <span className="text-gray-500">Verified On</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {new Date(selectedPayment.approvalDate).toLocaleString()}
                    </span>
                  </div>
                )}
                {selectedPayment.adminNotes && (
                  <div className="py-2">
                    <span className="text-gray-500 block mb-1">Admin Notes:</span>
                    <p className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 m-0 italic">
                      "{selectedPayment.adminNotes}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setSelectedPayment(null)}
                className="flex-1 bg-gray-100 dark:bg-zinc-800 font-bold p-2.5 rounded-xl border-none cursor-pointer dark:text-white text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedPayment(null);
                  navigate('/resident/payments');
                }}
                className="flex-1 bg-amber-400 hover:bg-amber-500 font-bold p-2.5 rounded-xl text-black border-none cursor-pointer text-xs shadow"
              >
                All Payments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentDashboard;
