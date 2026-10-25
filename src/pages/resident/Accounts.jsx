// src/pages/resident/Accounts.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Accounts = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    paymentMethod: 'cbe',
    providerName: 'Commercial Bank of Ethiopia',
    accountName: '',
    accountNumber: '',
    isDefault: false,
  });

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await api.accounts.getAll();
      const list = res.data?.data || res.data || [];
      setAccounts(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load accounts:', err);
      toast.error(err.response?.data?.message || 'Failed to load payout accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const maskAcc = (num) => {
    if (!num) return 'N/A';
    const s = String(num).trim();
    if (s.length <= 4) return s;
    return `****${s.slice(-4)}`;
  };

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setFormData({
      paymentMethod: 'cbe',
      providerName: 'Commercial Bank of Ethiopia',
      accountName: user?.fullName || '',
      accountNumber: '',
      isDefault: accounts.length === 0,
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (acc) => {
    setEditingAccount(acc);
    setFormData({
      paymentMethod: acc.paymentMethod || 'cbe',
      providerName: acc.providerName || '',
      accountName: acc.accountName || '',
      accountNumber: acc.accountNumber || '',
      isDefault: Boolean(acc.isDefault),
    });
    setOpenModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.accountName.trim()) {
      toast.error('Account holder name is required');
      return;
    }
    if (!formData.accountNumber.trim() || formData.accountNumber.trim().length < 4) {
      toast.error('Valid account or phone number is required (min 4 characters)');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        paymentMethod: formData.paymentMethod,
        providerName: formData.providerName || (formData.paymentMethod === 'cbe' ? 'Commercial Bank of Ethiopia' : 'Telebirr'),
        accountName: formData.accountName.trim(),
        accountNumber: formData.accountNumber.trim(),
        isDefault: formData.isDefault,
      };

      if (editingAccount) {
        await api.accounts.update(editingAccount.id, payload);
        toast.success('Payout destination account updated successfully');
      } else {
        await api.accounts.create(payload);
        toast.success('Payout destination account registered successfully');
      }

      setOpenModal(false);
      fetchAccounts();
    } catch (err) {
      console.error('Error saving account:', err);
      toast.error(err.response?.data?.message || 'Failed to save account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (accountId) => {
    try {
      await api.accounts.setDefault(accountId);
      toast.success('Primary payout destination updated');
      fetchAccounts();
    } catch (err) {
      console.error('Error setting default:', err);
      toast.error(err.response?.data?.message || 'Failed to set default destination');
    }
  };

  const handleDelete = async (accountId) => {
    if (!window.confirm('Are you sure you want to deactivate this payout destination account?')) return;
    try {
      await api.accounts.delete(accountId);
      toast.success('Payout account removed');
      fetchAccounts();
    } catch (err) {
      console.error('Error deleting account:', err);
      toast.error(err.response?.data?.message || 'Failed to delete account');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white m-0">
            Payout Destination Accounts
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 m-0 mt-0.5">
            Register your authorized Commercial Bank of Ethiopia (CBE) and Telebirr accounts to receive Equb lottery payouts and Iddir disbursements.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-amber-400 hover:bg-amber-500 text-black font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center space-x-2 border-none cursor-pointer shadow-md self-start sm:self-auto"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>Add Payout Account</span>
        </button>
      </div>

      {/* Info Notice */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-4 rounded-2xl flex items-start space-x-3 text-xs">
        <i className="fa-solid fa-shield-halved text-amber-500 text-base shrink-0 mt-0.5"></i>
        <div className="space-y-1">
          <p className="font-bold text-amber-900 dark:text-amber-300 m-0">
            Secure Destination Verification
          </p>
          <p className="text-amber-800 dark:text-amber-400 m-0 leading-relaxed">
            When you win an Equb rotation cycle or receive an approved Iddir mutual aid payment, the condominium administrator disburses funds directly to your registered destination account. Account numbers are masked for your privacy.
          </p>
        </div>
      </div>

      {/* Accounts List */}
      <div>
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            <i className="fa-solid fa-spinner fa-spin text-2xl mb-2 text-amber-400"></i>
            <p className="m-0">Loading your payout accounts...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 p-8 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl mx-auto mb-3">
              <i className="fa-solid fa-wallet"></i>
            </div>
            <h4 className="font-extrabold text-base text-gray-800 dark:text-gray-200 m-0">No Payout Accounts Registered</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-1 m-0">
              You haven't linked a bank or mobile money account yet. Administrators cannot send Equb winnings or Iddir benefits until you add an account.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 bg-amber-400 hover:bg-amber-500 text-black font-extrabold px-5 py-2 rounded-xl text-xs transition border-none cursor-pointer"
            >
              Add Your First Account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => {
              const isTelebirr = acc.paymentMethod === 'telebirr';

              return (
                <div
                  key={acc.id}
                  className={`bg-white dark:bg-zinc-900 rounded-3xl p-5 border transition shadow-sm flex flex-col justify-between ${
                    acc.isDefault
                      ? 'border-amber-400 ring-2 ring-amber-400/20'
                      : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
                            isTelebirr
                              ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                              : 'bg-amber-400/20 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          <i className={`fa-solid ${isTelebirr ? 'fa-mobile-screen' : 'fa-building-columns'}`}></i>
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-gray-900 dark:text-white m-0">
                            {acc.providerName || (isTelebirr ? 'Telebirr' : 'Commercial Bank of Ethiopia')}
                          </h4>
                          <span className="text-[10px] uppercase font-bold text-gray-400">
                            {acc.accountType || (isTelebirr ? 'Mobile Money' : 'Bank Account')}
                          </span>
                        </div>
                      </div>

                      {acc.isDefault && (
                        <span className="bg-amber-400/20 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full shrink-0">
                          Primary
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 py-2 text-xs">
                      <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                        <span>Account Holder:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{acc.accountName}</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                        <span>Account Number:</span>
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                          {maskAcc(acc.accountNumber)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                    {!acc.isDefault ? (
                      <button
                        onClick={() => handleSetDefault(acc.id)}
                        className="text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 font-bold bg-transparent border-none cursor-pointer p-0 text-[11px]"
                      >
                        Set as Default
                      </button>
                    ) : (
                      <span className="text-gray-400 text-[11px] font-medium flex items-center space-x-1">
                        <i className="fa-solid fa-check text-green-500 text-xs"></i>
                        <span>Default Payout Destination</span>
                      </span>
                    )}

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenEdit(acc)}
                        className="text-gray-400 hover:text-amber-500 bg-transparent border-none cursor-pointer p-1"
                        title="Edit Details"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(acc.id)}
                        className="text-gray-400 hover:text-red-500 bg-transparent border-none cursor-pointer p-1"
                        title="Remove Account"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="font-black text-base text-gray-900 dark:text-white m-0">
                {editingAccount ? 'Edit Destination Account' : 'Register Destination Account'}
              </h3>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-white border-none bg-transparent cursor-pointer p-1"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Payment Method */}
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Provider Type</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => {
                    const method = e.target.value;
                    setFormData({
                      ...formData,
                      paymentMethod: method,
                      providerName:
                        method === 'cbe'
                          ? 'Commercial Bank of Ethiopia'
                          : method === 'telebirr'
                          ? 'Telebirr'
                          : 'Commercial Bank',
                    });
                  }}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white font-semibold"
                >
                  <option value="cbe">Commercial Bank of Ethiopia (CBE)</option>
                  <option value="telebirr">Telebirr (Ethio Telecom Mobile Money)</option>
                  <option value="bank_transfer">Other Commercial Bank</option>
                </select>
              </div>

              {/* Provider Name */}
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Bank / Provider Name</label>
                <input
                  type="text"
                  required
                  value={formData.providerName}
                  onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
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
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder="Official name on bank or mobile money account"
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white font-medium"
                />
              </div>

              {/* Account / Phone Number */}
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  {formData.paymentMethod === 'telebirr' ? 'Telebirr Phone Number' : 'Bank Account Number'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder={formData.paymentMethod === 'telebirr' ? '09...' : '1000...'}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white font-mono font-medium"
                />
              </div>

              {/* Default checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="accountDefaultCheckbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-400"
                />
                <label htmlFor="accountDefaultCheckbox" className="font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                  Set as primary payout destination
                </label>
              </div>

              <div className="pt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 font-bold p-3 rounded-xl border-none cursor-pointer dark:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-amber-400 hover:bg-amber-500 font-extrabold p-3 rounded-xl border-none cursor-pointer text-black transition shadow-md flex items-center justify-center space-x-1"
                >
                  {submitting ? (
                    <span>Saving...</span>
                  ) : (
                    <span>{editingAccount ? 'Update Account' : 'Register Account'}</span>
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

export default Accounts;
