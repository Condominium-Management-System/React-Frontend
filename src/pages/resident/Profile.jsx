// src/pages/resident/Profile.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const ResidentProfile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [accounts, setAccounts] = useState([]);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('ha_theme') === 'dark';
  });

  // Modals
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openAccountModal, setOpenAccountModal] = useState(false);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingAccount, setSubmittingAccount] = useState(false);

  // Edit Profile Form
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // New Account Form
  const [editingAccountId, setEditingAccountId] = useState(null);
  const [accountForm, setAccountForm] = useState({
    paymentMethod: 'cbe',
    providerName: 'Commercial Bank of Ethiopia',
    accountName: '',
    accountNumber: '',
    isDefault: false,
  });

  // Fetch Authoritative Profile & Accounts
  const loadProfileAndAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const [fullProfileRes, accountsRes] = await Promise.allSettled([
        api.users.getMyFullProfile(),
        api.accounts.getAll()
      ]);

      if (fullProfileRes.status === 'fulfilled') {
        const data = fullProfileRes.value?.data?.data || null;
        setProfileData(data);
        if (data?.user) {
          setProfileForm({
            fullName: data.user.fullName || '',
            email: data.user.email || '',
            phoneNumber: data.user.phoneNumber || '',
            password: '',
            confirmPassword: '',
          });
        }
      }

      if (accountsRes.status === 'fulfilled') {
        const accList = accountsRes.value?.data?.data || [];
        setAccounts(Array.isArray(accList) ? accList : []);
      }
    } catch (err) {
      console.error('Failed to load full profile:', err);
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfileAndAccounts();
  }, [loadProfileAndAccounts]);

  const toggleTheme = () => {
    const nextTheme = !isDarkMode;
    setIsDarkMode(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ha_theme', 'dark');
      toast.info('Switched to Dark Mode');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ha_theme', 'light');
      toast.info('Switched to Light Mode');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Signed out successfully');
  };

  // Avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo size should be less than 5MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Submit Profile Updates
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!profileForm.fullName.trim() || profileForm.fullName.trim().length < 3) {
      toast.error('Full name must be at least 3 characters');
      return;
    }
    if (!profileForm.email.trim() || !profileForm.email.includes('@')) {
      toast.error('Please provide a valid email address');
      return;
    }
    if (!profileForm.phoneNumber.trim() || profileForm.phoneNumber.trim().length < 9) {
      toast.error('Please enter a valid phone number');
      return;
    }
    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (profileForm.password && profileForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setSubmittingProfile(true);

      const formData = new FormData();
      formData.append('fullName', profileForm.fullName.trim());
      formData.append('email', profileForm.email.trim().toLowerCase());
      formData.append('phoneNumber', profileForm.phoneNumber.trim());
      if (profileForm.password) {
        formData.append('password', profileForm.password);
      }
      if (avatarFile) {
        formData.append('profilePhoto', avatarFile);
      }

      const res = await api.auth.updateMyProfile(formData);
      const updatedUser = res.data?.data || {};

      if (updateUser) {
        updateUser(updatedUser);
      }

      toast.success('Profile credentials updated successfully!');
      setOpenEditModal(false);
      setProfileForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setAvatarFile(null);
      loadProfileAndAccounts();
    } catch (err) {
      console.error('Profile update error:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmittingProfile(false);
    }
  };


  const handleOpenEditAccount = (acc) => {
    setEditingAccountId(acc.id);
    setAccountForm({
      paymentMethod: acc.paymentMethod || 'cbe',
      providerName: acc.providerName || '',
      accountName: acc.accountName || '',
      accountNumber: acc.accountNumber || '',
      isDefault: Boolean(acc.isDefault),
    });
    setOpenAccountModal(true);
  };

  // Submit New Bank/Payout Account
  const handleAccountSubmit = async (e) => {
    e.preventDefault();

    if (!accountForm.accountName.trim()) {
      toast.error('Account holder name is required');
      return;
    }
    if (!accountForm.accountNumber.trim() || accountForm.accountNumber.trim().length < 4) {
      toast.error('Valid account or phone number is required');
      return;
    }

    try {
      setSubmittingAccount(true);
      const payload = {
        paymentMethod: accountForm.paymentMethod,
        providerName: accountForm.providerName || (accountForm.paymentMethod === 'cbe' ? 'Commercial Bank of Ethiopia' : 'Telebirr'),
        accountName: accountForm.accountName.trim(),
        accountNumber: accountForm.accountNumber.trim(),
        isDefault: accountForm.isDefault,
      };

      if (editingAccountId) {
        await api.accounts.update(editingAccountId, payload);
        toast.success('Payout destination account updated successfully!');
      } else {
        await api.accounts.create(payload);
        toast.success('Payout account added successfully!');
      }
      setOpenAccountModal(false);
      setEditingAccountId(null);
      setAccountForm({
        paymentMethod: 'cbe',
        providerName: 'Commercial Bank of Ethiopia',
        accountName: user?.fullName || '',
        accountNumber: '',
        isDefault: false,
      });
      loadProfileAndAccounts();
    } catch (err) {
      console.error('Account creation error:', err);
      toast.error(err.response?.data?.message || 'Failed to add account');
    } finally {
      setSubmittingAccount(false);
    }
  };

  // Set Default Account
  const handleSetDefaultAccount = async (accountId) => {
    try {
      await api.accounts.setDefault(accountId);
      toast.success('Default payout destination updated');
      loadProfileAndAccounts();
    } catch (err) {
      console.error('Error setting default account:', err);
      toast.error('Failed to update default account');
    }
  };

  // Delete Account
  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm('Are you sure you want to remove this payout destination?')) return;
    try {
      await api.accounts.delete(accountId);
      toast.success('Account removed');
      loadProfileAndAccounts();
    } catch (err) {
      console.error('Error deleting account:', err);
      toast.error('Failed to remove account');
    }
  };

  const isAdminUser = user?.role === 'condo_admin' || user?.role === 'super_admin';
  const adminDashboardPath = user?.role === 'super_admin' ? '/super-admin/dashboard' : '/condo-admin/dashboard';
  const isGuardUser = user?.role === 'guard';

  // Format masked account
  const maskAccountNumber = (accNo) => {
    if (!accNo) return '••••';
    const str = String(accNo).trim();
    if (str.length <= 4) return `•••• ${str}`;
    return `${str.slice(0, 2)}••••${str.slice(-4)}`;
  };

  if (loading && !profileData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D3AD32]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white m-0">
            Resident Profile & Financial Accounts
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 m-0 mt-0.5">
            Manage your personal credentials, verified contributions, and payout destination accounts
          </p>
        </div>
        <button
          onClick={() => {
            setProfileForm({
              fullName: user?.fullName || '',
              email: user?.email || '',
              phoneNumber: user?.phoneNumber || '',
              password: '',
              confirmPassword: '',
            });
            setOpenEditModal(true);
          }}
          className="bg-amber-400 hover:bg-amber-500 active:scale-95 text-black px-4 py-2.5 rounded-xl font-extrabold text-xs shadow transition border-none cursor-pointer self-start sm:self-auto flex items-center space-x-2"
        >
          <i className="fa-solid fa-user-pen text-xs"></i>
          <span>Edit Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Identity & Verification Badge */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 text-center shadow-sm">
            <div className="relative w-24 h-24 mx-auto mb-4">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.fullName}
                  className="w-full h-full object-cover rounded-full border-2 border-amber-400 shadow-md"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-amber-400 to-amber-500 text-black rounded-full flex items-center justify-center text-3xl font-black shadow-md">
                  {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AB'}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full flex items-center justify-center text-white text-[10px]">
                <i className="fa-solid fa-check"></i>
              </span>
            </div>
            
            <h3 className="font-black text-lg text-gray-900 dark:text-white m-0">
              {user?.fullName || 'Resident Member'}
            </h3>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 m-0">
              {profileData?.user?.condo?.condoName || user?.condo?.condoName || user?.condoCode || 'HomeAxis Condominium'}
            </p>
            
            <div className="mt-3 flex justify-center gap-1.5 flex-wrap">
              <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold">
                <i className="fa-solid fa-circle-check text-[10px] mr-1"></i> Verified Resident
              </span>
              {isAdminUser && (
                <span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold uppercase">
                  {user.role.replace('_', ' ')}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-5 pt-5 border-t border-gray-100 dark:border-zinc-800 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Block</span>
                <p className="font-black text-base text-gray-800 dark:text-white m-0">
                  {profileData?.user?.block || user?.block || 'A'}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Room / Unit</span>
                <p className="font-black text-base text-gray-800 dark:text-white m-0">
                  {profileData?.user?.roomNo || user?.roomNo || '101'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Contact & Credentials Card */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-3.5 text-xs">
            <h4 className="font-extrabold text-sm text-gray-900 dark:text-white m-0 pb-2 border-b border-gray-100 dark:border-zinc-800">
              Verified Contact Details
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <i className="fa-solid fa-envelope text-amber-500"></i> Email:
              </span>
              <span className="font-bold text-gray-900 dark:text-white">{user?.email || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <i className="fa-solid fa-phone text-amber-500"></i> Phone:
              </span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">{user?.phoneNumber || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <i className="fa-solid fa-calendar-check text-amber-500"></i> Member Since:
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (2/3 width on desktop): Financial Standing & Payout Accounts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Admin Switch Banner (If Admin) */}
          {isAdminUser && (
            <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-3xl p-5 text-black shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider bg-black/15 text-black px-2.5 py-0.5 rounded-full inline-block">
                  Administration Privileges
                </span>
                <h4 className="font-black text-base m-0 mt-1.5">
                  Return to Management Console
                </h4>
                <p className="text-xs font-medium text-black/85 m-0 mt-0.5">
                  Review resident payments, manage condominiums, assign maintenance reports, and monitor audits.
                </p>
              </div>
              <button
                onClick={() => navigate(adminDashboardPath)}
                className="bg-black text-amber-400 hover:bg-zinc-900 active:scale-95 font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow transition border-none cursor-pointer shrink-0 self-start sm:self-auto"
              >
                <span>Switch to Admin</span>
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </button>
            </div>
          )}

          {/* Guard Switch Banner (If Guard) */}
          {isGuardUser && (
            <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-3xl p-5 text-black shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider bg-black/15 text-black px-2.5 py-0.5 rounded-full inline-block">
                  Security Guard Privileges
                </span>
                <h4 className="font-black text-base m-0 mt-1.5">
                  Return to Guard Security Console
                </h4>
                <p className="text-xs font-medium text-black/85 m-0 mt-0.5">
                  Log visitor entries, manage gate passes, and monitor security cameras.
                </p>
              </div>
              <button
                onClick={() => navigate('/guard/dashboard')}
                className="bg-black text-amber-400 hover:bg-zinc-900 active:scale-95 font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow transition border-none cursor-pointer shrink-0 self-start sm:self-auto"
              >
                <span>Switch to Guard View</span>
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </button>
            </div>
          )}

          {/* 1. AUTHORITATIVE FINANCIAL SUMMARY CARDS */}
          <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white m-0">
                  Verified Financial Standing
                </h3>
                <p className="text-xs text-gray-400 m-0">Calculated exclusively from approved administrative transactions</p>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-600 dark:text-amber-400">
                Audited
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Verified</span>
                <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white m-0 mt-0.5">
                  {(profileData?.totalPaidVerified || 0).toLocaleString()} ETB
                </p>
                <span className="text-[10px] text-green-500 font-bold block mt-0.5">Approved dues</span>
              </div>

              <div className="bg-gray-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Equb Savings</span>
                <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white m-0 mt-0.5">
                  {(profileData?.equbVerifiedTotal || 0).toLocaleString()} ETB
                </p>
                <span className="text-[10px] text-amber-500 font-bold block mt-0.5">Revolving pot</span>
              </div>

              <div className="bg-gray-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Iddir Reserve</span>
                <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white m-0 mt-0.5">
                  {(profileData?.iddirVerifiedTotal || 0).toLocaleString()} ETB
                </p>
                <span className="text-[10px] text-rose-500 font-bold block mt-0.5">Emergency fund</span>
              </div>

              <div className="bg-gray-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Pending Review</span>
                <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white m-0 mt-0.5">
                  {profileData?.totalPending || 0}
                </p>
                <span className="text-[10px] text-amber-500 font-bold block mt-0.5">Awaiting audit</span>
              </div>
            </div>

            {/* Business Rule Notice */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-900/40 p-3 rounded-2xl flex items-start space-x-2 text-xs text-amber-800 dark:text-amber-300">
              <i className="fa-solid fa-shield-halved text-amber-500 mt-0.5 shrink-0"></i>
              <p className="m-0 leading-relaxed">
                <strong className="font-bold">Verified Contribution Rule:</strong> Payments remain in pending status until condominium administration audits the banking transaction. Unverified submissions do not count toward Equb draw eligibility or Iddir benefits.
              </p>
            </div>
          </div>

          {/* 2. PAYOUT DESTINATION ACCOUNTS (CBE, TELEBIRR, ETC.) */}
          <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white m-0 flex items-center gap-2">
                  <i className="fa-solid fa-building-columns text-amber-500"></i>
                  <span>Payout Destination Accounts</span>
                </h3>
                <p className="text-xs text-gray-400 m-0">Authorized CBE, Telebirr, and bank accounts for Equb winnings & Iddir disbursements</p>
              </div>
              <button
                onClick={() => {
                  setAccountForm({
                    paymentMethod: 'cbe',
                    providerName: 'Commercial Bank of Ethiopia',
                    accountName: user?.fullName || '',
                    accountNumber: '',
                    isDefault: accounts.length === 0,
                  });
                  setOpenAccountModal(true);
                }}
                className="bg-black hover:bg-zinc-900 text-amber-400 active:scale-95 px-3.5 py-2 rounded-xl text-xs font-bold border-none cursor-pointer flex items-center space-x-1.5 self-start sm:self-auto shadow-sm"
              >
                <i className="fa-solid fa-plus text-xs"></i>
                <span>Add Payout Account</span>
              </button>
              <button
                onClick={() => navigate('/resident/accounts')}
                className="bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 active:scale-95 px-3 py-2 rounded-xl text-xs font-bold border-none cursor-pointer flex items-center space-x-1 self-start sm:self-auto"
              >
                <span>Manage Accounts</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </button>
            </div>

            {accounts.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-zinc-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 p-6">
                <i className="fa-solid fa-credit-card text-3xl text-gray-300 dark:text-zinc-700 mb-2"></i>
                <h4 className="font-bold text-gray-700 dark:text-gray-300 text-sm m-0">No Payout Accounts Configured</h4>
                <p className="text-xs text-gray-400 mt-1 m-0 max-w-sm mx-auto">
                  Add your Commercial Bank of Ethiopia (CBE) or Telebirr account to receive Equb round pots or community distributions directly.
                </p>
                <button
                  onClick={() => setOpenAccountModal(true)}
                  className="mt-3 bg-amber-400 text-black text-xs font-bold px-3 py-1.5 rounded-xl border-none cursor-pointer"
                >
                  Configure Account Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {accounts.map((acc) => {
                  const isTelebirr = (acc.paymentMethod || '').toLowerCase() === 'telebirr';

                  return (
                    <div
                      key={acc.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        acc.isDefault
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-400 shadow-sm'
                          : 'bg-gray-50 dark:bg-zinc-800/60 border-gray-200 dark:border-zinc-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-base shrink-0">
                              <i className={isTelebirr ? 'fa-solid fa-mobile-screen' : 'fa-solid fa-building-columns'}></i>
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-gray-900 dark:text-white m-0">
                                {acc.providerName || (isTelebirr ? 'Telebirr' : 'CBE')}
                              </h4>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 m-0">
                                {acc.accountName}
                              </p>
                            </div>
                          </div>
                          {acc.isDefault && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-400 text-black">
                              Default
                            </span>
                          )}
                        </div>

                        <div className="bg-white dark:bg-zinc-900/80 p-2.5 rounded-xl text-xs font-mono font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center justify-between border border-gray-100 dark:border-zinc-700/50">
                          <span className="text-[10px] uppercase font-bold text-gray-400">Account:</span>
                          <span>{maskAccountNumber(acc.accountNumber)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 dark:border-zinc-700/60 text-xs">
                        {!acc.isDefault ? (
                          <button
                            onClick={() => handleSetDefaultAccount(acc.id)}
                            className="text-amber-600 dark:text-amber-400 hover:underline font-bold text-[11px] border-none bg-transparent cursor-pointer p-0"
                          >
                            Set as Default
                          </button>
                        ) : (
                          <span className="text-[11px] text-green-500 font-bold flex items-center gap-1">
                            <i className="fa-solid fa-check text-[10px]"></i> Active destination
                          </span>
                        )}

                        <button
                            onClick={() => handleOpenEditAccount(acc)}
                            className="text-gray-400 hover:text-amber-500 text-xs border-none bg-transparent cursor-pointer p-1"
                            title="Edit Account"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteAccount(acc.id)}
                          className="text-red-500 hover:text-red-700 text-xs border-none bg-transparent cursor-pointer p-1"
                          title="Remove Account"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. PORTAL PREFERENCES & SETTINGS */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 divide-y divide-gray-100 dark:divide-zinc-800 shadow-sm overflow-hidden text-xs sm:text-sm">
            {/* Appearance Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800/60 active:scale-98 transition border-none bg-transparent cursor-pointer"
            >
              <span className="flex items-center space-x-3">
                <i className="fa-solid fa-circle-half-stroke text-amber-500 text-sm"></i>
                <span className="font-medium">Theme Display</span>
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase flex items-center gap-1.5">
                <i className={isDarkMode ? "fa-solid fa-moon" : "fa-solid fa-sun"}></i>
                <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
              </span>
            </button>

            {/* Building Hotline */}
            <button
              onClick={() => toast.info('Building Management Hotline: +251 911 222 333')}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800/60 active:scale-98 transition border-none bg-transparent cursor-pointer"
            >
              <span className="flex items-center space-x-3">
                <i className="fa-solid fa-headset text-amber-500 text-sm"></i>
                <span className="font-medium">Condominium Management Hotline</span>
              </span>
              <span className="text-xs font-bold text-gray-500">+251 911 222 333</span>
            </button>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="w-full p-4 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-2xl font-bold text-xs sm:text-sm active:scale-98 transition border-none cursor-pointer flex items-center justify-center space-x-2"
          >
            <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
            <span>Sign Out of HomeAxis</span>
          </button>
        </div>
      </div>

      {/* MODAL: EDIT PROFILE CREDENTIALS */}
      {openEditModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-zinc-800">
              <div>
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white m-0">Edit Profile</h3>
                <p className="text-xs text-gray-400 m-0">Update your verified personal details and contact</p>
              </div>
              <button 
                onClick={() => setOpenEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white border-none bg-transparent cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              {/* Avatar Upload */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-amber-400/20 flex items-center justify-center font-bold text-lg text-amber-600 shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <i className="fa-solid fa-camera"></i>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Profile Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-400 file:text-black cursor-pointer"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white font-medium"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white font-medium"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={profileForm.phoneNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white font-medium font-mono"
                />
              </div>

              {/* Change Password (Optional) */}
              <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
                <span className="block font-bold text-gray-800 dark:text-white mb-2">Change Password (Optional)</span>
                <div className="space-y-2">
                  <input
                    type="password"
                    placeholder="New password (leave blank to keep current)"
                    value={profileForm.password}
                    onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white font-medium"
                  />
                  {profileForm.password && (
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={profileForm.confirmPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white font-medium"
                    />
                  )}
                </div>
              </div>

              <div className="pt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setOpenEditModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 font-bold p-3 rounded-xl border-none cursor-pointer dark:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProfile}
                  className="flex-1 bg-amber-400 hover:bg-amber-500 font-black p-3 rounded-xl text-black border-none cursor-pointer transition flex items-center justify-center space-x-2 shadow"
                >
                  {submittingProfile ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PAYOUT ACCOUNT */}
      {openAccountModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-zinc-800">
              <div>
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white m-0">Add Payout Destination</h3>
                <p className="text-xs text-gray-400 m-0">Connect CBE or Telebirr to receive funds</p>
              </div>
              <button 
                onClick={() => setOpenAccountModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white border-none bg-transparent cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleAccountSubmit} className="space-y-3.5 text-xs">
              {/* Payment Method */}
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Method</label>
                <select
                  value={accountForm.paymentMethod}
                  onChange={(e) => {
                    const method = e.target.value;
                    setAccountForm({
                      ...accountForm,
                      paymentMethod: method,
                      providerName: method === 'cbe' ? 'Commercial Bank of Ethiopia' : method === 'telebirr' ? 'Telebirr' : 'Bank Transfer'
                    });
                  }}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white font-semibold"
                >
                  <option value="cbe">Commercial Bank of Ethiopia (CBE)</option>
                  <option value="telebirr">Telebirr (Mobile Money)</option>
                  <option value="bank_transfer">Other Commercial Bank</option>
                </select>
              </div>

              {/* Provider / Bank Name */}
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Bank / Provider Name</label>
                <input
                  type="text"
                  required
                  value={accountForm.providerName}
                  onChange={(e) => setAccountForm({ ...accountForm, providerName: e.target.value })}
                  placeholder="e.g. Commercial Bank of Ethiopia, Dashen Bank, Awash Bank"
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white font-medium"
                />
              </div>

              {/* Account Holder Name */}
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Account Holder Name</label>
                <input
                  type="text"
                  required
                  value={accountForm.accountName}
                  onChange={(e) => setAccountForm({ ...accountForm, accountName: e.target.value })}
                  placeholder="Exact name on banking account"
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white font-medium"
                />
              </div>

              {/* Account / Phone Number */}
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  {accountForm.paymentMethod === 'telebirr' ? 'Telebirr Phone Number' : 'Bank Account Number'}
                </label>
                <input
                  type="text"
                  required
                  value={accountForm.accountNumber}
                  onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                  placeholder={accountForm.paymentMethod === 'telebirr' ? '09...' : '1000...'}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white font-mono font-medium"
                />
              </div>

              {/* Set as Default */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isDefaultAccount"
                  checked={accountForm.isDefault}
                  onChange={(e) => setAccountForm({ ...accountForm, isDefault: e.target.checked })}
                  className="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-400"
                />
                <label htmlFor="isDefaultAccount" className="font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                  Set as default payout destination
                </label>
              </div>

              <div className="pt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setOpenAccountModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 font-bold p-3 rounded-xl border-none cursor-pointer dark:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAccount}
                  className="flex-1 bg-amber-400 hover:bg-amber-500 font-black p-3 rounded-xl text-black border-none cursor-pointer transition flex items-center justify-center space-x-2 shadow"
                >
                  {submittingAccount ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Add Account</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentProfile;
