// src/pages/resident/Iddir.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const ResidentIddir = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: urlIddirId } = useParams();
  const [searchParams] = useSearchParams();

  const [iddirs, setIddirs] = useState([]);
  const [selectedIddir, setSelectedIddir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myClaims, setMyClaims] = useState([]);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [openClaimModal, setOpenClaimModal] = useState(false);
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [requestingJoin, setRequestingJoin] = useState(false);

  const [claimForm, setClaimForm] = useState({
    claimType: 'bereavement',
    reason: '',
    amountRequested: 30000,
    description: '',
  });

  const fetchIddirData = async () => {
    try {
      setLoading(true);
      const res = await api.iddirs.getMy();
      const list = res.data?.data || [];
      if (Array.isArray(list) && list.length > 0) {
        setIddirs(list);
        if (urlIddirId) {
          const match = list.find(d => d.id === urlIddirId);
          setSelectedIddir(match || list[0]);
        } else {
          setSelectedIddir(list[0]);
        }
      } else {
        setIddirs([]);
        setSelectedIddir(null);
      }
    } catch (err) {
      console.error('Error fetching Iddir:', err);
      toast.error('Failed to load Iddir details');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyClaims = async () => {
    try {
      setLoadingClaims(true);
      const res = await api.iddirs.getMyClaims();
      const list = res.data?.data || res.data || [];
      setMyClaims(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching claims:', err);
    } finally {
      setLoadingClaims(false);
    }
  };

  useEffect(() => {
    fetchIddirData();
    fetchMyClaims();
  }, [urlIddirId]);

  useEffect(() => {
    if (searchParams.get('action') === 'claim') {
      setOpenClaimModal(true);
    }
  }, [searchParams]);

  const handleRequestJoin = () => {
    if (!selectedIddir) return;
    navigate(`/resident/reports?action=new&type=iddir_membership&groupId=${selectedIddir.id}&groupName=${encodeURIComponent(selectedIddir.name)}`);
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIddir) {
      toast.error('Please select an active Iddir group first');
      return;
    }
    if (!claimForm.reason.trim()) {
      toast.error('Please provide a summary reason for the assistance claim');
      return;
    }
    if (!claimForm.description.trim() || claimForm.description.trim().length < 10) {
      toast.error('Please describe the situation in at least 10 characters');
      return;
    }

    try {
      setSubmittingClaim(true);
      const payload = {
        claimType: claimForm.claimType,
        reason: claimForm.reason,
        amountRequested: parseFloat(claimForm.amountRequested) || 0,
        description: claimForm.description,
      };

      await api.iddirs.createClaim(selectedIddir.id, payload);
      toast.success('Iddir assistance claim successfully filed! The committee will review your application.');
      setOpenClaimModal(false);
      setClaimForm({
        claimType: 'bereavement',
        reason: '',
        amountRequested: 30000,
        description: '',
      });
      fetchMyClaims();
    } catch (err) {
      console.error('Claim submission error:', err);
      toast.error(err.response?.data?.message || 'Failed to submit assistance claim');
    } finally {
      setSubmittingClaim(false);
    }
  };

  const monthlyDues = parseFloat(selectedIddir?.contributionAmount) || 500;
  const myVerifiedContribution = selectedIddir?.myVerifiedContribution || 0;
  const myPendingCount = selectedIddir?.myPendingPaymentsCount || 0;
  const isMember = selectedIddir?.isMember || false;
  const membershipStatus = selectedIddir?.membershipStatus || (isMember ? 'active' : 'not_member');
  const disbursements = selectedIddir?.disbursements || [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase">Submitted</span>;
      case 'under_review':
        return <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase">Under Review</span>;
      case 'approved':
        return <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase">Approved</span>;
      case 'disbursed':
        return <span className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase">Disbursed</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase">Declined</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white m-0">
            Resident Community Iddir
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 m-0 mt-0.5">
            Mutual assistance fund providing bereavement, health, and emergency support
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {iddirs.length > 1 && (
            <select
              value={selectedIddir?.id || ''}
              onChange={(e) => {
                const found = iddirs.find(d => d.id === e.target.value);
                if (found) {
                  setSelectedIddir(found);
                  navigate(`/resident/iddir/${found.id}`);
                }
              }}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-bold rounded-xl p-2.5 dark:text-white"
            >
              {iddirs.map(idr => (
                <option key={idr.id} value={idr.id}>{idr.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          <i className="fa-solid fa-spinner fa-spin text-3xl mb-2 text-amber-400"></i>
          <p className="m-0">Loading Iddir mutual assistance fund...</p>
        </div>
      ) : !selectedIddir ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-200 dark:border-zinc-800 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
            <i className="fa-solid fa-hand-holding-heart"></i>
          </div>
          <h3 className="font-black text-lg text-gray-900 dark:text-white m-0">No Active Iddir Found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
            There is currently no mutual assistance Iddir registered for your condominium. Building administration manages community welfare funds.
          </p>
          <button
            onClick={() => navigate('/resident/reports')}
            className="mt-4 bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl border-none cursor-pointer"
          >
            Inquire with Administration
          </button>
        </div>
      ) : (
        /* 2-Column Responsive Layout */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Fund Pool & Policies */}
          <div className="space-y-6">
            {/* Overview Card */}
            <div className="bg-zinc-900 text-white p-6 rounded-3xl shadow-lg border border-zinc-800 relative">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] font-black uppercase bg-amber-400 text-black px-3 py-1 rounded-full">
                    {selectedIddir.condo?.condoName || 'Community Mutual Aid'}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black mt-2 m-0 tracking-tight">
                    {selectedIddir.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium m-0 mt-0.5">
                    Membership Standing: {membershipStatus === 'active' ? 'Active Protected Member' : membershipStatus === 'pending' ? 'Application Pending Review' : 'Enrolled Resident'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-400/20 rounded-2xl flex items-center justify-center text-2xl text-amber-400">
                  <i className="fa-solid fa-hand-holding-heart"></i>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5 bg-zinc-800/60 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Monthly Dues</span>
                  <p className="text-xl sm:text-2xl font-black text-amber-400 m-0">
                    {monthlyDues.toLocaleString()} ETB
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Verified Paid</span>
                  <p className="text-xl sm:text-2xl font-black text-white m-0">
                    {myVerifiedContribution.toLocaleString()} ETB
                  </p>
                </div>
              </div>

              {myPendingCount > 0 && (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-950/30 border border-amber-900/40 text-[11px] text-amber-400 flex items-center gap-2">
                  <i className="fa-solid fa-clock"></i>
                  <span>{myPendingCount} payment(s) awaiting verification. Unverified payments do not count toward verified totals.</span>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                {membershipStatus === 'not_member' && (
                  <button
                    onClick={handleRequestJoin}
                    disabled={requestingJoin}
                    className="flex-1 bg-amber-400 hover:bg-amber-500 text-black font-black p-3 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow transition border-none cursor-pointer disabled:opacity-50"
                  >
                    <i className={`fa-solid ${requestingJoin ? 'fa-spinner fa-spin' : 'fa-user-plus'} text-sm`}></i>
                    <span>{requestingJoin ? 'Submitting...' : 'Request to Join Iddir'}</span>
                  </button>
                )}

                {membershipStatus === 'pending' && (
                  <div className="flex-1 bg-zinc-800 text-amber-300 font-bold p-3 rounded-xl text-xs flex items-center justify-center space-x-2 border border-amber-500/20">
                    <i className="fa-solid fa-hourglass-half"></i>
                    <span>Membership Request Pending Review</span>
                  </div>
                )}

                {membershipStatus === 'active' && (
                  <>
                    <button
                      onClick={() => setOpenClaimModal(true)}
                      className="flex-1 bg-amber-400 text-black font-extrabold p-3 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow hover:bg-amber-500 transition border-none cursor-pointer"
                    >
                      <i className="fa-solid fa-file-signature text-sm"></i>
                      <span>Request Assistance</span>
                    </button>
                    <button
                      onClick={() => navigate('/resident/payments?action=pay')}
                      className="flex-1 bg-zinc-800 text-white font-extrabold p-3 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow hover:bg-zinc-700 transition border-none cursor-pointer"
                    >
                      <i className="fa-solid fa-credit-card text-sm text-amber-400"></i>
                      <span>Pay Monthly Dues</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Assistance Tiers Card */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h4 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white m-0 flex items-center gap-2">
                <i className="fa-solid fa-handshake-angle text-amber-500"></i>
                <span>Disbursement Tiers & Bylaws</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white block">Bereavement Assistance</span>
                    <span className="text-[11px] text-gray-400">Immediate family loss funeral coverage</span>
                  </div>
                  <span className="font-black text-amber-600 dark:text-amber-400 text-sm">30,000 ETB</span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white block">Medical Emergency Relief</span>
                    <span className="text-[11px] text-gray-400">Hospitalization and emergency health care</span>
                  </div>
                  <span className="font-black text-amber-600 dark:text-amber-400 text-sm">15,000 ETB</span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white block">Property Disaster Support</span>
                    <span className="text-[11px] text-gray-400">Fire, flood, or acute structure emergency</span>
                  </div>
                  <span className="font-black text-amber-600 dark:text-amber-400 text-sm">20,000 ETB</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
                <i className="fa-solid fa-circle-check text-amber-500 mr-1.5"></i>
                <span>Qualifying households must have verified monthly dues up to date to receive disbursements.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Resident Claims History & Community Log */}
          <div className="space-y-6">
            
            {/* My Assistance Claims */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-zinc-800">
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white m-0">
                    My Assistance Applications ({myClaims.length})
                  </h4>
                  <p className="text-xs text-gray-400 m-0">Formal claims submitted to the condominium Iddir committee</p>
                </div>
                {membershipStatus === 'active' && (
                  <button
                    onClick={() => setOpenClaimModal(true)}
                    className="bg-amber-400 hover:bg-amber-500 text-black text-xs font-bold px-3 py-1.5 rounded-xl border-none cursor-pointer flex items-center gap-1"
                  >
                    <i className="fa-solid fa-plus text-[10px]"></i>
                    <span>New Claim</span>
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {loadingClaims ? (
                  <div className="text-center py-6 text-xs text-gray-400">
                    <i className="fa-solid fa-spinner fa-spin mr-1.5"></i> Loading claims...
                  </div>
                ) : myClaims.length > 0 ? (
                  myClaims.map((claim) => (
                    <div key={claim.id} className="p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-zinc-800 text-xs space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-black text-gray-900 dark:text-white capitalize text-sm">
                            {claim.reason}
                          </div>
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold uppercase">
                            {claim.claimType?.replace('_', ' ')}
                          </span>
                        </div>
                        {getStatusBadge(claim.status)}
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 m-0 text-xs line-clamp-2">
                        {claim.description}
                      </p>

                      <div className="pt-2 border-t border-gray-200 dark:border-zinc-700/60 flex items-center justify-between text-[11px] text-gray-400">
                        <span>Requested: <strong className="text-gray-900 dark:text-white">{parseFloat(claim.amountRequested || 0).toLocaleString()} ETB</strong></span>
                        <span>{new Date(claim.createdAt).toLocaleDateString()}</span>
                      </div>

                      {claim.reviewNotes && (
                        <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 mt-1">
                          <strong className="block mb-0.5">Committee Note:</strong>
                          {claim.reviewNotes}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-gray-400">
                    <i className="fa-solid fa-folder-open text-2xl mb-2 text-gray-300 dark:text-zinc-700 block"></i>
                    You have not submitted any assistance claims yet.
                  </div>
                )}
              </div>
            </div>

            {/* Disbursements Log */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-zinc-800">
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white m-0">
                    Community Mutual Aid Log
                  </h4>
                  <p className="text-xs text-gray-400 m-0">Verified emergency disbursements audited by administrators</p>
                </div>
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 uppercase">
                  Audited
                </span>
              </div>

              <div className="space-y-2.5">
                {disbursements.length > 0 ? (
                  disbursements.map((tx) => (
                    <div key={tx.id} className="p-3.5 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 dark:text-white capitalize">
                          {tx.description || 'Community Assistance Disbursement'}
                        </span>
                        <span className="font-black text-green-600 dark:text-green-400">
                          {parseFloat(tx.amount).toLocaleString()} ETB
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <span>Ref: {tx.referenceNo || 'Admin Approved'}</span>
                        <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-gray-400">
                    No recent mutual aid disbursements recorded for this cycle.
                  </div>
                )}
              </div>
            </div>

            {/* Bylaws */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-3">
              <h4 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white m-0 flex items-center gap-2">
                <i className="fa-solid fa-scroll text-amber-500"></i>
                <span>Mutual Assistance Governance</span>
              </h4>
              <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-2 pl-4 list-disc m-0 leading-relaxed">
                <li>Iddir contributions are deposited into the condominium community account.</li>
                <li>Assistance disbursements require committee verification and documentation.</li>
                <li>Funds are transferred directly to the resident's verified payout account.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT ASSISTANCE CLAIM */}
      {openClaimModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-zinc-800">
              <div>
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white m-0">Request Iddir Assistance</h3>
                <p className="text-xs text-gray-400 m-0">Official claim filed to the Condominium Mutual Aid Committee</p>
              </div>
              <button 
                onClick={() => setOpenClaimModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white border-none bg-transparent cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleClaimSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Assistance Category</label>
                <select
                  value={claimForm.claimType}
                  onChange={(e) => {
                    const ct = e.target.value;
                    let suggested = 30000;
                    if (ct === 'medical_emergency') suggested = 15000;
                    if (ct === 'property_damage') suggested = 20000;
                    if (ct === 'hardship') suggested = 10000;
                    setClaimForm({ ...claimForm, claimType: ct, amountRequested: suggested });
                  }}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white font-semibold"
                >
                  <option value="bereavement">Bereavement Support (suggested 30,000 ETB)</option>
                  <option value="medical_emergency">Medical Emergency Assistance (suggested 15,000 ETB)</option>
                  <option value="property_damage">Property Disaster Relief (suggested 20,000 ETB)</option>
                  <option value="hardship">Family Hardship Assistance</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Claim Reason / Summary
                </label>
                <input
                  type="text"
                  required
                  value={claimForm.reason}
                  onChange={(e) => setClaimForm({ ...claimForm, reason: e.target.value })}
                  placeholder="e.g. Funeral expense assistance for immediate dependent"
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Amount Requested (ETB)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={claimForm.amountRequested}
                  onChange={(e) => setClaimForm({ ...claimForm, amountRequested: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Incident Details & Description
                </label>
                <textarea
                  rows="4"
                  required
                  value={claimForm.description}
                  onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
                  placeholder="Describe the incident, dates, family member affected, and immediate support needed..."
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white"
                ></textarea>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-[11px]">
                <i className="fa-solid fa-circle-info mr-1.5 text-amber-500"></i>
                <span>Your claim will be recorded directly into the Condominium Iddir Claims register for administrative review and financial audit.</span>
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setOpenClaimModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-zinc-800 font-bold p-3 rounded-xl border-none cursor-pointer dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingClaim}
                  className="flex-1 bg-amber-400 hover:bg-amber-500 font-black p-3 rounded-xl text-black border-none cursor-pointer transition flex items-center justify-center space-x-2 shadow"
                >
                  {submittingClaim ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Official Claim</span>
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

export default ResidentIddir;
