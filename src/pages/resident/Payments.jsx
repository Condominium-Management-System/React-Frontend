// src/pages/resident/Payments.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const ResidentPayments = () => {
  const location = useLocation();
  const { id: urlPaymentId } = useParams();
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, verified, rejected
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [condoAccounts, setCondoAccounts] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Active equbs and iddirs in condo for eligibility validation
  const [equbs, setEqubs] = useState([]);
  const [iddirs, setIddirs] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    paymentType: 'service_charge',
    amount: '1000',
    monthYear: new Date().toISOString().slice(0, 7),
    paymentMethod: 'cbe',
    referenceNo: '',
    equbId: '',
    iddirId: '',
    adminNotes: ''
  });

  // Open modal if redirected with ?action=pay
  useEffect(() => {
    if (location.search.includes('action=pay')) {
      setOpenModal(true);
    }
  }, [location.search]);

  // Fetch payments & community groups
  const fetchPaymentsData = useCallback(async () => {
    try {
      setLoading(true);
      const [payRes, equbRes, iddirRes, condoAccRes] = await Promise.allSettled([
        api.payments.getMy({ limit: 100 }),
        api.equbs.getMy().catch(() => ({ data: { data: [] } })),
        api.iddirs.getMy().catch(() => ({ data: { data: [] } })),
        api.condoAccounts.getAll().catch(() => ({ data: { data: [] } }))
      ]);

      if (condoAccRes.status === 'fulfilled') {
        const accList = condoAccRes.value?.data?.data || condoAccRes.value?.data || [];
        setCondoAccounts(Array.isArray(accList) ? accList : []);
      }

      let loadedPayments = [];
      if (payRes.status === 'fulfilled') {
        const resData = payRes.value?.data?.data;
        const payList = resData?.payments || resData?.items || (Array.isArray(resData) ? resData : []);
        loadedPayments = payList.map(p => ({
          ...p,
          referenceNo: p.referenceNo || p.transaction?.referenceNo || 'N/A'
        }));
        setPayments(loadedPayments);
      }

      if (equbRes.status === 'fulfilled') {
        const eqList = equbRes.value?.data?.data || [];
        setEqubs(Array.isArray(eqList) ? eqList : []);
        if (eqList.length > 0) {
          setFormData(prev => ({ ...prev, equbId: eqList[0].id }));
        }
      }

      if (iddirRes.status === 'fulfilled') {
        const idList = iddirRes.value?.data?.data || [];
        setIddirs(Array.isArray(idList) ? idList : []);
        if (idList.length > 0) {
          setFormData(prev => ({ ...prev, iddirId: idList[0].id }));
        }
      }

      // If URL has payment ID, select it or load directly
      if (urlPaymentId) {
        const match = loadedPayments.find(p => p.id === urlPaymentId);
        if (match) {
          setSelectedPayment(match);
        } else {
          // Fetch directly from API
          api.payments.getById(urlPaymentId)
            .then(res => {
              if (res.data?.data) {
                const singlePay = res.data.data;
                setSelectedPayment({
                  ...singlePay,
                  referenceNo: singlePay.referenceNo || singlePay.transaction?.referenceNo || 'N/A'
                });
              }
            })
            .catch(() => {});
        }
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      toast.error('Failed to load payments history');
    } finally {
      setLoading(false);
    }
  }, [urlPaymentId]);

  useEffect(() => {
    fetchPaymentsData();
  }, [fetchPaymentsData]);

  // Match current active condo destination account
  const currentCondoDestination = condoAccounts.find(
    a => a.status === 'active' && a.paymentMethod === formData.paymentMethod && a.isDefault
  ) || condoAccounts.find(
    a => a.status === 'active' && a.paymentMethod === formData.paymentMethod
  ) || condoAccounts.find(
    a => a.status === 'active' && a.isDefault
  ) || condoAccounts.find(
    a => a.status === 'active'
  );

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    const amt = parseFloat(formData.amount);
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid payment amount greater than zero');
      return;
    }

    if (!formData.referenceNo || formData.referenceNo.trim().length < 4) {
      toast.error('Please provide a valid banking reference number or transaction ID');
      return;
    }

    if (!currentCondoDestination) {
      toast.error('Your condominium has not configured an active payment destination account. Please contact your condominium administration.');
      return;
    }

    // Eligibility check for Equb
    if (formData.paymentType === 'equb') {
      if (!formData.equbId && equbs.length === 0) {
        toast.error('No active Equb found for your condominium to contribute to');
        return;
      }
    }

    // Eligibility check for Iddir
    if (formData.paymentType === 'iddir') {
      if (!formData.iddirId && iddirs.length === 0) {
        toast.error('No active Iddir found for your condominium to pay dues to');
        return;
      }
    }

    try {
      setSubmitting(true);

      const payload = {
        paymentType: formData.paymentType,
        amount: amt,
        paymentMethod: formData.paymentMethod,
        monthYear: formData.monthYear,
        referenceNo: formData.referenceNo.trim(),
        adminNotes: formData.adminNotes || null,
        equbId: formData.paymentType === 'equb' ? (formData.equbId || (equbs[0] && equbs[0].id)) : null,
        iddirId: formData.paymentType === 'iddir' ? (formData.iddirId || (iddirs[0] && iddirs[0].id)) : null,
      };

      const res = await api.payments.create(payload);
      const createdRecord = res.data?.data?.payment || res.data?.data;

      // Authoritative immediate UI update
      const newPayItem = {
        id: createdRecord?.id || `temp-${Date.now()}`,
        amount: amt,
        paymentType: formData.paymentType,
        paymentMethod: formData.paymentMethod,
        monthYear: formData.monthYear,
        status: 'pending',
        referenceNo: createdRecord?.referenceNo || createdRecord?.transaction?.referenceNo || formData.referenceNo.trim(),
        createdAt: createdRecord?.createdAt || new Date().toISOString(),
        adminNotes: formData.adminNotes || null,
        ...createdRecord,
      };

      setPayments(prev => [newPayItem, ...prev.filter(p => p.id !== newPayItem.id)]);
      toast.success('Payment submitted! Status is Pending Verification until administrator review.');
      window.dispatchEvent(new CustomEvent('ha_payment_submitted', { detail: newPayItem }));
      setOpenModal(false);
      setFormData({
        paymentType: 'service_charge',
        amount: '1000',
        monthYear: new Date().toISOString().slice(0, 7),
        paymentMethod: 'cbe',
        referenceNo: '',
        equbId: equbs[0]?.id || '',
        iddirId: iddirs[0]?.id || '',
        adminNotes: ''
      });

      // Refetch from server in background
      fetchPaymentsData();
    } catch (err) {
      console.error('Payment submission failed:', err);
      toast.error(err.response?.data?.message || 'Payment submission failed. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter payments
  const filteredPayments = payments.filter(p => {
    if (filter === 'all') return true;
    const status = (p.status || '').toLowerCase();
    if (filter === 'verified') return status === 'approved' || status === 'verified';
    if (filter === 'pending') return status === 'pending';
    if (filter === 'rejected') return status === 'rejected';
    return true;
  });

  // Calculate statistics from current authoritative records
  const verifiedList = payments.filter(p => (p.status || '').toLowerCase() === 'approved' || (p.status || '').toLowerCase() === 'verified');
  const totalVerifiedSum = verifiedList.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const pendingList = payments.filter(p => (p.status || '').toLowerCase() === 'pending');
  const rejectedList = payments.filter(p => (p.status || '').toLowerCase() === 'rejected');

  const handleCopyReference = (ref) => {
    if (!ref || ref === 'N/A') return;
    navigator.clipboard.writeText(ref);
    toast.success(`Copied reference: ${ref}`);
  };

  // Canonical status badge mapping
  const renderStatusBadge = (rawStatus) => {
    const s = (rawStatus || 'pending').toLowerCase();
    if (s === 'approved' || s === 'verified') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
          <i className="fa-solid fa-circle-check mr-1 text-[9px]"></i>
          Verified / Approved
        </span>
      );
    }
    if (s === 'rejected') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">
          <i className="fa-solid fa-circle-xmark mr-1 text-[9px]"></i>
          Rejected
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
        <i className="fa-solid fa-clock mr-1 text-[9px]"></i>
        Pending Verification
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white m-0">
            Payment & Financial Records
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 m-0 mt-0.5">
            Submit service charges, equb savings, and review real-time payment verification statuses
          </p>
        </div>
        <button
          onClick={() => setOpenModal(true)}
          className="bg-amber-400 hover:bg-amber-500 text-black text-xs sm:text-sm font-extrabold px-4 py-2.5 rounded-xl flex items-center justify-center space-x-2 shadow transition border-none cursor-pointer self-start sm:self-auto"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>Make Payment</span>
        </button>
      </div>

      {/* Summary Stat Cards (Responsive) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs text-gray-400 font-semibold block">Total Verified</span>
          <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-white m-0 mt-1">
            {totalVerifiedSum.toLocaleString()} ETB
          </p>
          <span className="text-[11px] text-green-500 font-bold mt-1 block">
            {verifiedList.length} approved records
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs text-gray-400 font-semibold block">Pending Verification</span>
          <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-white m-0 mt-1">
            {pendingList.length} Payments
          </p>
          <span className="text-[11px] text-amber-500 font-bold mt-1 block">
            Awaiting admin check
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs text-gray-400 font-semibold block">Available Methods</span>
          <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-white m-0 mt-1">
            CBE / TeleBirr
          </p>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">
            Direct reference upload
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs text-gray-400 font-semibold block">Total Transactions</span>
          <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-white m-0 mt-1">
            {payments.length}
          </p>
          <span className="text-[11px] text-blue-500 font-bold mt-1 block">
            All submitted history
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {[
          { key: 'all', label: `All (${payments.length})` },
          { key: 'pending', label: `Pending (${pendingList.length})` },
          { key: 'verified', label: `Verified (${verifiedList.length})` },
          { key: 'rejected', label: `Rejected (${rejectedList.length})` }
        ].map((tab) => {
          const isActive = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition border-none cursor-pointer ${
                isActive
                  ? 'bg-black text-amber-400 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800 hover:border-amber-400'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Responsive Payments Cards Grid */}
      <div>
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            <i className="fa-solid fa-spinner fa-spin text-2xl mb-2 text-amber-400"></i>
            <p className="m-0">Loading payment records...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8">
            <i className="fa-solid fa-receipt text-4xl mb-3 text-gray-300 dark:text-zinc-700"></i>
            <h4 className="font-bold text-gray-700 dark:text-gray-300 text-base m-0">No Payments Found</h4>
            <p className="text-xs text-gray-400 mt-1 m-0">No payment records match the selected filter tab.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPayments.map((pay) => (
              <div 
                key={pay.id}
                onClick={() => {
                  setSelectedPayment(pay);
                  navigate(`/resident/payments/${pay.id}`);
                }}
                className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-amber-400 transition flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg shrink-0">
                        <i className="fa-solid fa-receipt"></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white capitalize m-0">
                          {pay.paymentType ? pay.paymentType.replace('_', ' ') : 'Payment'}
                        </h4>
                        <p className="text-xs text-gray-400 m-0 mt-0.5">
                          {pay.createdAt ? new Date(pay.createdAt).toLocaleDateString() : 'Recent'} • {pay.paymentMethod ? pay.paymentMethod.toUpperCase() : 'CBE'}
                        </p>
                      </div>
                    </div>
                    {renderStatusBadge(pay.status)}
                  </div>

                  {pay.referenceNo && pay.referenceNo !== 'N/A' && (
                    <div className="bg-gray-50 dark:bg-zinc-800/60 p-2.5 rounded-xl text-xs font-mono text-gray-600 dark:text-gray-300 mb-3 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Ref:</span>
                      <span className="font-bold">{pay.referenceNo}</span>
                    </div>
                  )}

                  {pay.adminNotes && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic m-0 mb-3 line-clamp-2">
                      "{pay.adminNotes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">
                    Period: {pay.monthYear || 'Current'}
                  </span>
                  <span className="text-base font-black text-gray-900 dark:text-white">
                    {parseFloat(pay.amount).toLocaleString()} ETB
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETAIL MODAL: PERSISTENT PAYMENT AUDIT VIEW */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-2 border-b border-gray-100 dark:border-zinc-800">
              <div>
                {renderStatusBadge(selectedPayment.status)}
                <h3 className="font-extrabold text-lg text-gray-900 dark:text-white m-0 mt-1.5 capitalize">
                  {selectedPayment.paymentType?.replace('_', ' ') || 'Payment Details'}
                </h3>
                <p className="text-xs text-gray-400 m-0">ID: {selectedPayment.id}</p>
              </div>
              <button 
                onClick={() => {
                  setSelectedPayment(null);
                  navigate('/resident/payments');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white border-none bg-transparent cursor-pointer p-1"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl text-center border border-amber-200 dark:border-amber-900/40">
                <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 block">Total Amount</span>
                <p className="text-2xl font-black text-gray-900 dark:text-white m-0 mt-0.5">
                  {parseFloat(selectedPayment.amount).toLocaleString()} ETB
                </p>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Contribution Period: {selectedPayment.monthYear || 'N/A'}
                </span>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-zinc-800 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500">Payment Channel</span>
                  <span className="font-bold uppercase text-gray-900 dark:text-white">{selectedPayment.paymentMethod || 'CBE'}</span>
                </div>
                {selectedPayment.referenceNo && selectedPayment.referenceNo !== 'N/A' && (
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-gray-500">Reference Number</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-gray-900 dark:text-white">{selectedPayment.referenceNo}</span>
                      <button
                        onClick={() => handleCopyReference(selectedPayment.referenceNo)}
                        className="text-amber-500 hover:text-amber-600 border-none bg-transparent cursor-pointer p-0 text-xs"
                        title="Copy Reference"
                      >
                        <i className="fa-solid fa-copy"></i>
                      </button>
                    </div>
                  </div>
                )}
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500">Submission Timestamp</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedPayment.createdAt ? new Date(selectedPayment.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
                {selectedPayment.approvalDate && (
                  <div className="py-2.5 flex justify-between">
                    <span className="text-gray-500">Verification Date</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {new Date(selectedPayment.approvalDate).toLocaleString()}
                    </span>
                  </div>
                )}
                {selectedPayment.adminNotes && (
                  <div className="py-2.5">
                    <span className="text-gray-500 block mb-1">Administrative Notes</span>
                    <p className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 m-0 italic">
                      "{selectedPayment.adminNotes}"
                    </p>
                  </div>
                )}
              </div>

              {/* Critical Business Rule Banner */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
                <i className="fa-solid fa-shield-halved text-amber-500 mr-1.5"></i>
                <span>Payments remain in <strong>Pending Verification</strong> status until condominium administrators audit the bank deposit. Pending or rejected payments do not count toward verified Equb or Iddir totals.</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setSelectedPayment(null);
                  navigate('/resident/payments');
                }}
                className="w-full bg-amber-400 hover:bg-amber-500 font-extrabold p-3 rounded-xl text-black border-none cursor-pointer text-xs shadow transition"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MAKE PAYMENT */}
      {openModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-zinc-800">
              <div>
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white m-0">Submit Payment</h3>
                <p className="text-xs text-gray-400 m-0">Provide transaction information for administration review</p>
              </div>
              <button 
                onClick={() => setOpenModal(false)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white border-none bg-transparent cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs">
              {/* Payment Type */}
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Payment Purpose</label>
                <select
                  value={formData.paymentType}
                  onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white text-xs font-semibold"
                >
                  <option value="service_charge">🏢 Monthly Condominium Service Charge</option>
                  <option value="equb">💰 Equb Rotating Savings Contribution</option>
                  <option value="iddir">🤝 Iddir Mutual Aid Monthly Dues</option>
                  <option value="special_assessment">🔨 Special Maintenance Assessment</option>
                </select>
              </div>

              {/* Equb Selection (if equb) */}
              {formData.paymentType === 'equb' && (
                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Select Active Equb</label>
                  {equbs.length > 0 ? (
                    <select
                      value={formData.equbId}
                      onChange={(e) => setFormData({ ...formData, equbId: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white text-xs"
                    >
                      {equbs.map(eq => (
                        <option key={eq.id} value={eq.id}>
                          {eq.name} ({parseFloat(eq.contributionAmount).toLocaleString()} ETB/round)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-amber-500 font-bold m-0">No active Equb cycle found in your condominium.</p>
                  )}
                </div>
              )}

              {/* Iddir Selection (if iddir) */}
              {formData.paymentType === 'iddir' && (
                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Select Active Iddir</label>
                  {iddirs.length > 0 ? (
                    <select
                      value={formData.iddirId}
                      onChange={(e) => setFormData({ ...formData, iddirId: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white text-xs"
                    >
                      {iddirs.map(idr => (
                        <option key={idr.id} value={idr.id}>
                          {idr.name} ({parseFloat(idr.contributionAmount).toLocaleString()} ETB/month)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-amber-500 font-bold m-0">No active Iddir group found in your condominium.</p>
                  )}
                </div>
              )}

              {/* Amount & Period */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Amount (ETB)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white font-black"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Billing Period (YYYY-MM)</label>
                  <input
                    type="month"
                    required
                    value={formData.monthYear}
                    onChange={(e) => setFormData({ ...formData, monthYear: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Payment Channel</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-3 rounded-xl border flex items-center space-x-2.5 cursor-pointer ${
                    formData.paymentMethod === 'cbe' ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/20' : 'border-gray-200 dark:border-zinc-800'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cbe"
                      checked={formData.paymentMethod === 'cbe'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'cbe' })}
                      className="text-amber-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-gray-900 dark:text-white block">CBE Transfer</span>
                      <span className="text-[10px] text-gray-400">Commercial Bank</span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-center space-x-2.5 cursor-pointer ${
                    formData.paymentMethod === 'telebirr' ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/20' : 'border-gray-200 dark:border-zinc-800'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="telebirr"
                      checked={formData.paymentMethod === 'telebirr'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'telebirr' })}
                      className="text-amber-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-gray-900 dark:text-white block">Telebirr</span>
                      <span className="text-[10px] text-gray-400">Mobile Money</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Official Condominium Destination Account (Read-Only) */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-amber-400/10 dark:to-zinc-800 border border-amber-300/80 dark:border-amber-500/30 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <i className="fa-solid fa-building-columns"></i> Official Destination Account
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                    Automatic Routing
                  </span>
                </div>

                {currentCondoDestination ? (
                  <div>
                    <p className="font-extrabold text-sm text-gray-900 dark:text-white m-0">
                      {currentCondoDestination.accountName}
                    </p>
                    <div className="flex items-center space-x-2 font-mono text-xs text-gray-700 dark:text-gray-300 mt-1">
                      <span className="font-semibold">{currentCondoDestination.providerName || (formData.paymentMethod === 'cbe' ? 'Commercial Bank of Ethiopia' : 'Telebirr')}:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400 select-all">
                        {currentCondoDestination.accountNumber || currentCondoDestination.maskedAccountNumber}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 m-0">
                      Transfer your funds to this account, then enter the reference number below for administrative verification.
                    </p>
                  </div>
                ) : (
                  <div className="text-amber-600 dark:text-amber-400 text-xs py-1">
                    <i className="fa-solid fa-triangle-exclamation mr-1"></i>
                    No active {formData.paymentMethod.toUpperCase()} destination account configured by your condominium administration.
                  </div>
                )}
              </div>

              {/* Reference Number */}
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Transaction Reference Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FT260901ABCD or Telebirr Trans ID"
                  value={formData.referenceNo}
                  onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white font-mono font-bold"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Find this reference in your CBE mobile SMS or Telebirr receipt.
                </span>
              </div>

              {/* Resident Notes */}
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Notes (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="Add any clarification for the finance administrator..."
                  value={formData.adminNotes}
                  onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white"
                ></textarea>
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-zinc-800 font-bold p-3 rounded-xl border-none cursor-pointer dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-amber-400 hover:bg-amber-500 font-black p-3 rounded-xl text-black border-none cursor-pointer transition flex items-center justify-center space-x-2 shadow"
                >
                  {submitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Payment</span>
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

export default ResidentPayments;
