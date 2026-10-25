// src/pages/resident/Equb.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const ResidentEqub = () => {
  const navigate = useNavigate();
  const { id: urlEqubId } = useParams();

  const [equbs, setEqubs] = useState([]);
  const [selectedEqub, setSelectedEqub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestingJoin, setRequestingJoin] = useState(false);

  const fetchEqubData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.equbs.getMy();
      const list = res.data?.data || [];
      if (Array.isArray(list) && list.length > 0) {
        setEqubs(list);
        if (urlEqubId) {
          const match = list.find(q => q.id === urlEqubId);
          setSelectedEqub(match || list[0]);
        } else {
          setSelectedEqub(list[0]);
        }
      } else {
        setEqubs([]);
        setSelectedEqub(null);
      }
    } catch (err) {
      console.error('Error fetching equbs:', err);
      toast.error('Failed to load Equb data');
    } finally {
      setLoading(false);
    }
  }, [urlEqubId]);

  const handleRequestJoin = async () => {
    if (!selectedEqub) return;
    try {
      setRequestingJoin(true);
      await api.equbs.requestMembership(selectedEqub.id);
      toast.success('Membership request submitted successfully!');
      fetchEqubData();
    } catch (err) {
      navigate(`/resident/reports?action=new&type=equb_membership&groupId=${selectedEqub.id}&groupName=${encodeURIComponent(selectedEqub.name)}`);
    } finally {
      setRequestingJoin(false);
    }
  };

  useEffect(() => {
    fetchEqubData();
  }, [fetchEqubData]);

  const membersCount = selectedEqub?.members?.length || 0;
  const contribution = parseFloat(selectedEqub?.contributionAmount) || 2000;
  const totalPot = contribution * (membersCount || 1);
  const myVerifiedContribution = selectedEqub?.myVerifiedContribution || 0;
  const myPendingCount = selectedEqub?.myPendingPaymentsCount || 0;
  const isMember = selectedEqub?.isMember || false;
  const membershipStatus = selectedEqub?.membershipStatus || (isMember ? 'active' : 'not_member');
  const hasWon = selectedEqub?.isWinner || selectedEqub?.myMembership?.hasReceivedPayout || false;
  const myPayout = selectedEqub?.myPayout;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white m-0">
            Community Equb (Rotating Savings)
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 m-0 mt-0.5">
            Traditional monthly revolving fund among verified condominium neighbors
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {equbs.length > 1 && (
            <select
              value={selectedEqub?.id || ''}
              onChange={(e) => {
                const found = equbs.find(q => q.id === e.target.value);
                if (found) {
                  setSelectedEqub(found);
                  navigate(`/resident/equb/${found.id}`);
                }
              }}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-bold rounded-xl p-2.5 dark:text-white"
            >
              {equbs.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          <i className="fa-solid fa-spinner fa-spin text-3xl mb-2 text-amber-400"></i>
          <p className="m-0">Loading Equb savings pool...</p>
        </div>
      ) : !selectedEqub ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-200 dark:border-zinc-800 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 bg-amber-400/20 text-amber-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
            <i className="fa-solid fa-piggy-bank"></i>
          </div>
          <h3 className="font-black text-lg text-gray-900 dark:text-white m-0">No Active Equb Found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
            There is currently no active revolving savings Equb registered for your condominium. Building administration creates and opens new cycles.
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
          {/* Left Column: Pot & Controls */}
          <div className="space-y-6">
            {/* Overview Card */}
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-black p-6 rounded-3xl shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] font-black uppercase bg-black/20 text-black px-3 py-1 rounded-full">
                    {selectedEqub.condo?.condoName || 'Community Cycle'}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black mt-2 m-0 tracking-tight">
                    {selectedEqub.name}
                  </h3>
                  <p className="text-xs text-black/80 font-medium m-0 mt-0.5">
                    Round {selectedEqub.currentRound || 1} of {selectedEqub.totalRounds || membersCount || 10} • Cycle Status: {selectedEqub.status || 'Active'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-black/10 rounded-2xl flex items-center justify-center text-2xl text-black">
                  <i className="fa-solid fa-piggy-bank"></i>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5 bg-black/10 p-4 rounded-2xl backdrop-blur-sm">
                <div>
                  <span className="text-[10px] uppercase font-bold opacity-80 block">Total Pot Pool</span>
                  <p className="text-xl sm:text-2xl font-black m-0">{totalPot.toLocaleString()} ETB</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold opacity-80 block">Monthly Contribution</span>
                  <p className="text-xl sm:text-2xl font-black m-0">{contribution.toLocaleString()} ETB</p>
                </div>
              </div>

              {/* Verified Standing inside Card */}
              <div className="mt-4 pt-3 border-t border-black/15 flex items-center justify-between text-xs font-bold">
                <span>My Verified Contribution:</span>
                <span className="text-sm font-black">{myVerifiedContribution.toLocaleString()} ETB</span>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {membershipStatus === 'active' && (
                  <button
                    onClick={() => navigate(`/resident/payments?action=pay`)}
                    className="flex-1 bg-black text-amber-400 font-extrabold p-3 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow hover:bg-zinc-900 transition border-none cursor-pointer"
                  >
                    <i className="fa-solid fa-hand-holding-dollar text-sm"></i>
                    <span>Pay Monthly Dues</span>
                  </button>
                )}

                {membershipStatus === 'not_member' && (
                  <button
                    onClick={handleRequestJoin}
                    disabled={requestingJoin}
                    className="flex-1 bg-black text-amber-400 font-extrabold p-3 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow hover:bg-zinc-900 transition border-none cursor-pointer disabled:opacity-50"
                  >
                    <i className={`fa-solid ${requestingJoin ? 'fa-spinner fa-spin' : 'fa-user-plus'} text-sm`}></i>
                    <span>{requestingJoin ? 'Submitting Request...' : 'Request to Join Equb'}</span>
                  </button>
                )}

                {membershipStatus === 'pending' && (
                  <div className="flex-1 bg-black/40 text-amber-300 font-bold p-3 rounded-xl text-xs flex items-center justify-center space-x-2 border border-black/20">
                    <i className="fa-solid fa-hourglass-half"></i>
                    <span>Membership Request Pending Review</span>
                  </div>
                )}

                {membershipStatus === 'rejected' && (
                  <div className="flex-1 bg-black/40 text-red-300 font-bold p-3 rounded-xl text-xs flex items-center justify-center space-x-2 border border-black/20">
                    <i className="fa-solid fa-circle-xmark"></i>
                    <span>Membership Declined</span>
                  </div>
                )}

                <button
                  onClick={() => navigate('/resident/profile')}
                  className="bg-white text-black font-extrabold px-4 py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-1.5 shadow hover:bg-gray-100 transition border-none cursor-pointer"
                >
                  <i className="fa-solid fa-building-columns text-sm"></i>
                  <span>Payout Bank</span>
                </button>
              </div>
            </div>

            {/* Winner / Eligibility Status Banner */}
            {hasWon ? (
              <div className="bg-green-100 dark:bg-green-950/40 border-2 border-green-500 p-5 rounded-3xl text-left space-y-2 shadow-sm">
                <div className="flex items-center space-x-2 text-green-700 dark:text-green-400 font-black text-xs uppercase">
                  <i className="fa-solid fa-trophy text-amber-500 text-base"></i>
                  <span>Congratulations! Cycle Winner</span>
                </div>
                <h4 className="text-lg font-black text-gray-900 dark:text-white m-0">
                  You received the revolving savings pot!
                </h4>
                <p className="text-xs text-gray-700 dark:text-gray-300 m-0">
                  Amount awarded: <strong className="text-green-600 dark:text-green-400 font-black">{totalPot.toLocaleString()} ETB</strong>. Payout processed to your designated bank account.
                </p>
                {myPayout && (
                  <div className="bg-white/60 dark:bg-black/30 p-2.5 rounded-xl text-xs font-mono text-gray-800 dark:text-gray-200 mt-2">
                    Round #{myPayout.roundNumber} • Status: {myPayout.status?.toUpperCase() || 'COMPLETED'}
                  </div>
                )}
              </div>
            ) : membershipStatus === 'pending' ? (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 p-5 rounded-3xl text-left space-y-2 shadow-sm">
                <span className="text-xs text-amber-700 dark:text-amber-400 font-extrabold uppercase flex items-center gap-1.5">
                  <i className="fa-solid fa-clock"></i> Membership Request Under Review
                </span>
                <h4 className="text-base font-black text-gray-900 dark:text-white m-0">
                  Awaiting Administrative Verification
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 m-0 leading-relaxed">
                  Your request to join <strong>{selectedEqub.name}</strong> has been submitted. Condominium administration will verify your resident standing and activate your membership before dues can be contributed.
                </p>
              </div>
            ) : membershipStatus === 'not_member' ? (
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-2">
                <span className="text-xs text-amber-600 dark:text-amber-400 font-extrabold uppercase flex items-center gap-1.5">
                  <i className="fa-solid fa-shield-halved text-amber-500"></i> Membership Required
                </span>
                <h4 className="text-base font-black text-gray-900 dark:text-white m-0">
                  Join this Community Savings Pool
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 m-0 leading-relaxed">
                  You are not yet a registered participant in {selectedEqub.name}. Condominium residents in good standing can apply to participate in revolving savings rounds.
                </p>
                <button
                  onClick={handleRequestJoin}
                  disabled={requestingJoin}
                  className="mt-2 bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl border-none cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <i className={`fa-solid ${requestingJoin ? 'fa-spinner fa-spin' : 'fa-user-plus'}`}></i>
                  <span>{requestingJoin ? 'Submitting Request...' : 'Submit Request to Join'}</span>
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-2">
                <span className="text-xs text-amber-600 dark:text-amber-400 font-extrabold uppercase flex items-center gap-1.5">
                  <i className="fa-solid fa-shield-halved text-amber-500"></i> My Draw Eligibility Status
                </span>
                
                <h4 className="text-base font-black text-gray-900 dark:text-white m-0">
                  {myVerifiedContribution >= contribution
                    ? 'Eligible for Upcoming Cycle Draw'
                    : 'Contribution Required for Draw Eligibility'}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 m-0 leading-relaxed">
                  {myVerifiedContribution >= contribution
                    ? `You have contributed ${myVerifiedContribution.toLocaleString()} ETB in verified funds. You are included in the upcoming administrator draw.`
                    : `Your verified contribution is ${myVerifiedContribution.toLocaleString()} ETB (required: ${contribution.toLocaleString()} ETB per round). Pay dues and ensure administrative verification to qualify.`}
                </p>
                {myPendingCount > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                    <i className="fa-solid fa-clock text-amber-500"></i>
                    <span>{myPendingCount} payment(s) currently pending review. Pending payments do not count toward draw eligibility until admin approves.</span>
                  </div>
                )}
              </div>
            )}

            {/* Bylaws & Financial Integrity */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-3">
              <h4 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white m-0 flex items-center gap-2">
                <i className="fa-solid fa-scale-balanced text-amber-500"></i>
                <span>Equb Regulations & Business Rules</span>
              </h4>
              <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-2 pl-4 list-disc m-0 leading-relaxed">
                <li>A resident's payment is not a verified contribution until condominium administration verifies the banking reference.</li>
                <li>Pending or unverified payments never count toward winner draw eligibility.</li>
                <li>Draw winners receive payout distributions exclusively via verified CBE or Telebirr accounts registered on their profile.</li>
                <li>Each household receives the full revolving savings pot exactly once per full cycle.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Member Roster & Past Payouts */}
          <div className="space-y-6">
            
            {/* Member Roster */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-zinc-800">
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white m-0">
                    Participating Households ({membersCount})
                  </h4>
                  <p className="text-xs text-gray-400 m-0">Registered members in current savings round</p>
                </div>
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 uppercase">
                  {selectedEqub?.status || 'Active'}
                </span>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {selectedEqub?.members && selectedEqub.members.length > 0 ? (
                  selectedEqub.members.map((mem, idx) => (
                    <div key={mem.id || idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl text-xs">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <span className="font-bold text-gray-800 dark:text-gray-200 block">
                            {mem.user?.fullName || mem.fullName || `Household #${idx + 1}`}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {mem.user?.block ? `Blk ${mem.user.block} ` : ''}{mem.user?.roomNo ? `Room ${mem.user.roomNo}` : ''}
                          </span>
                        </div>
                      </div>
                      <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                        mem.hasReceivedPayout || mem.hasWon 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' 
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                      }`}>
                        {mem.hasReceivedPayout || mem.hasWon ? 'Won Round' : 'In Draw Pool'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-gray-400">
                    No participating households registered yet.
                  </div>
                )}
              </div>
            </div>

            {/* Past Round Payout History */}
            {selectedEqub.payouts && selectedEqub.payouts.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-3">
                <h4 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white m-0 flex items-center gap-2">
                  <i className="fa-solid fa-clock-rotate-left text-amber-500"></i>
                  <span>Past Round Draws & Winners</span>
                </h4>
                <div className="divide-y divide-gray-100 dark:divide-zinc-800 text-xs">
                  {selectedEqub.payouts.map((p) => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white block">
                          Round #{p.roundNumber}: {p.winner?.fullName || 'Resident Member'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {p.payoutDate ? new Date(p.payoutDate).toLocaleDateString() : 'Awarded'}
                        </span>
                      </div>
                      <span className="font-black text-amber-600 dark:text-amber-400 text-xs">
                        {parseFloat(p.amount || totalPot).toLocaleString()} ETB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentEqub;
