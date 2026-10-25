// src/pages/resident/Reports.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const ResidentReports = () => {
  const { id: urlReportId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [responseMsg, setResponseMsg] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);
  const [prefilledGroup, setPrefilledGroup] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'plumbing',
    priority: 'medium',
    equbId: null,
    iddirId: null,
  });
  const [photoFile, setPhotoFile] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.reports.getMy();
      const list = res.data?.data?.items || res.data?.data || res.data || [];
      const safeList = Array.isArray(list) ? list : [];
      setReports(safeList);

      if (urlReportId && safeList.length > 0) {
        const found = safeList.find(r => r.id === urlReportId);
        if (found) setSelectedReport(found);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [urlReportId]);

  useEffect(() => {
    const action = searchParams.get('action');
    const type = searchParams.get('type');
    const groupId = searchParams.get('groupId');
    const groupName = searchParams.get('groupName');

    if (action === 'new' && type && groupId) {
      const isEqub = type === 'equb_membership';
      setFormData({
        title: isEqub ? `Equb Membership Request - ${groupName || 'Savings Pool'}` : `Iddir Membership Request - ${groupName || 'Mutual Aid'}`,
        description: isEqub 
          ? `Household application to join ${groupName || 'Equb'}. Household identity and unit standing verified for monthly contributions.` 
          : `Household application to enroll in ${groupName || 'Iddir'} mutual assistance fund. Unit standing verified for monthly dues.`,
        category: type,
        priority: 'medium',
        equbId: isEqub ? groupId : null,
        iddirId: !isEqub ? groupId : null,
      });
      setPrefilledGroup({
        type: isEqub ? 'Equb' : 'Iddir',
        id: groupId,
        name: groupName || (isEqub ? 'Community Equb' : 'Community Iddir')
      });
      setOpenCreateModal(true);
    }
  }, [searchParams]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter a report title');
      return;
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('category', formData.category);
      data.append('priority', formData.priority);
      if (formData.equbId) data.append('equbId', formData.equbId);
      if (formData.iddirId) data.append('iddirId', formData.iddirId);
      if (photoFile) {
        data.append('photo', photoFile);
      }

      await api.reports.create(data);
      toast.success(
        formData.category === 'equb_membership' || formData.category === 'iddir_membership'
          ? 'Group membership request submitted! Condominium administration has received your application.'
          : 'Report submitted successfully! Admins have been notified.'
      );
      setOpenCreateModal(false);
      setFormData({
        title: '',
        description: '',
        category: 'plumbing',
        priority: 'medium',
        equbId: null,
        iddirId: null,
      });
      setPrefilledGroup(null);
      setPhotoFile(null);
      fetchReports();
    } catch (err) {
      console.error('Error submitting report:', err);
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendResponse = async (reportId) => {
    if (!responseMsg.trim()) return;

    try {
      setSendingResponse(true);
      await api.reports.addResponse(reportId, { message: responseMsg.trim() });
      toast.success('Response sent to administration');
      setResponseMsg('');
      
      // Refresh report data
      const res = await api.reports.getById(reportId);
      if (res.data?.data) {
        setSelectedReport(res.data.data);
      }
      fetchReports();
    } catch (err) {
      console.error('Error sending response:', err);
      toast.error('Failed to send response');
    } finally {
      setSendingResponse(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
      case 'resolved':
        return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
      case 'rejected':
      case 'closed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
      case 'in_progress':
      case 'assigned':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400';
      default:
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
    }
  };

  const formatStatus = (status, category) => {
    const isGroup = category === 'equb_membership' || category === 'iddir_membership';
    switch (status) {
      case 'approved':
        return isGroup ? 'Approved & Active' : 'Approved';
      case 'resolved':
        return isGroup ? 'Approved & Active' : 'Resolved';
      case 'rejected':
        return isGroup ? 'Membership Declined' : 'Rejected';
      case 'closed':
        return isGroup ? 'Declined / Closed' : 'Closed';
      case 'in_progress':
      case 'assigned':
        return 'Under Review';
      default:
        return isGroup ? 'Pending Approval' : 'Reported';
    }
  };

  const formatCategory = (category) => {
    if (category === 'equb_membership') return 'Equb Membership Request';
    if (category === 'iddir_membership') return 'Iddir Membership Request';
    return category;
  };

  const resolvedCount = reports.filter(r => r.status === 'resolved' || r.status === 'closed' || r.status === 'approved').length;
  const inProgressCount = reports.filter(r => r.status !== 'resolved' && r.status !== 'closed' && r.status !== 'approved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white m-0">
            Maintenance & Issue Reports
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 m-0 mt-0.5">
            Submit repair requests, track resolution progress, and message facility managers
          </p>
        </div>
        <button
          onClick={() => setOpenCreateModal(true)}
          className="bg-amber-400 hover:bg-amber-500 text-black text-xs sm:text-sm font-extrabold px-4 py-2.5 rounded-xl flex items-center justify-center space-x-2 shadow transition border-none cursor-pointer self-start sm:self-auto"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>Report New Issue</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs text-gray-400 font-semibold block">Total Submitted</span>
          <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-white m-0 mt-1">
            {reports.length}
          </p>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Lifetime reports</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs text-gray-400 font-semibold block">In Progress</span>
          <p className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400 m-0 mt-1">
            {inProgressCount}
          </p>
          <span className="text-[11px] text-purple-500 font-bold mt-1 block">Active servicing</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs text-gray-400 font-semibold block">Resolved</span>
          <p className="text-lg sm:text-xl font-black text-green-600 dark:text-green-400 m-0 mt-1">
            {resolvedCount}
          </p>
          <span className="text-[11px] text-green-500 font-bold mt-1 block">Completed repairs</span>
        </div>
      </div>

      {/* Reports Responsive Grid */}
      <div>
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            <i className="fa-solid fa-spinner fa-spin text-2xl mb-2 text-amber-400"></i>
            <p className="m-0">Loading your issue reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8 text-gray-400">
            <i className="fa-solid fa-wrench text-4xl mb-3 text-gray-300 dark:text-zinc-700"></i>
            <h4 className="font-bold text-gray-700 dark:text-gray-300 text-base m-0">No Reports Filed</h4>
            <p className="text-xs text-gray-400 mt-1 m-0">Everything looks great! You haven't filed any maintenance or facility issues.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {reports.map((rep) => (
              <div
                key={rep.id}
                onClick={() => {
                  setSelectedReport(rep);
                  navigate(`/resident/reports/${rep.id}`);
                }}
                className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-amber-400 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${getStatusBadge(rep.status)}`}>
                      {formatStatus(rep.status, rep.category)}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white m-0">
                    {rep.title}
                  </h4>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 m-0 leading-relaxed">
                    {rep.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs text-gray-400">
                  <span className="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5 truncate pr-2">
                    {rep.category === 'equb_membership' ? (
                      <i className="fa-solid fa-piggy-bank text-amber-500 text-xs"></i>
                    ) : rep.category === 'iddir_membership' ? (
                      <i className="fa-solid fa-hand-holding-heart text-rose-500 text-xs"></i>
                    ) : (
                      <i className="fa-solid fa-tag text-amber-500 text-[10px]"></i>
                    )}
                    <span className="truncate">{formatCategory(rep.category)}</span>
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center space-x-1 shrink-0">
                    <span>Details</span>
                    <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE REPORT MODAL */}
      {openCreateModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white m-0">
                {prefilledGroup ? `${prefilledGroup.type} Membership Application` : 'Submit Report or Request'}
              </h3>
              <button 
                onClick={() => {
                  setOpenCreateModal(false);
                  setPrefilledGroup(null);
                }}
                className="text-gray-400 hover:text-white border-none bg-transparent cursor-pointer p-1"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {prefilledGroup && (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm font-bold shrink-0">
                  <i className={`fa-solid ${prefilledGroup.type === 'Equb' ? 'fa-piggy-bank' : 'fa-hand-holding-heart'}`}></i>
                </div>
                <div>
                  <strong className="block font-bold">Applying for {prefilledGroup.name}</strong>
                  <span className="text-[11px] opacity-90">Official membership request dispatched to condominium management. Admin approval will activate your participation.</span>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Request / Report Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Water leak in bathroom, Equb Membership Request"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white font-semibold"
                  >
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="structural">Structural</option>
                    <option value="security">Security</option>
                    <option value="cleaning">Cleaning / Sanitation</option>
                    <option value="other">Other Maintenance</option>
                    <option value="equb_membership">Equb Membership Request</option>
                    <option value="iddir_membership">Iddir Membership Request</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Urgency Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white font-semibold capitalize"
                  >
                    <option value="low">Low (Standard)</option>
                    <option value="medium">Medium (Attention)</option>
                    <option value="high">High (Urgent)</option>
                    <option value="emergency">Emergency (Immediate)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Detailed Description & Reason</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Provide background information, unit details, or justification for the report..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white focus:outline-none focus:border-amber-400"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Attach Document or Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files[0])}
                  className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-400 file:text-black cursor-pointer"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpenCreateModal(false);
                    setPrefilledGroup(null);
                  }}
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
                    <span>Submit Report</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL WITH CHAT RESPONSES */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${getStatusBadge(selectedReport.status)}`}>
                  {formatStatus(selectedReport.status, selectedReport.category)}
                </span>
                <h3 className="font-black text-lg text-gray-900 dark:text-white m-0 mt-1.5">
                  {selectedReport.title}
                </h3>
                <p className="text-xs text-gray-400 m-0 mt-0.5">
                  Category: <span className="font-semibold text-gray-600 dark:text-gray-300">{formatCategory(selectedReport.category)}</span> • Reported {new Date(selectedReport.createdAt).toLocaleDateString()}
                </p>
                {(selectedReport.equb || selectedReport.iddir) && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold">
                    <i className={`fa-solid ${selectedReport.equb ? 'fa-piggy-bank' : 'fa-hand-holding-heart'}`}></i>
                    <span>Associated Group: {selectedReport.equb?.name || selectedReport.iddir?.name}</span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => {
                  setSelectedReport(null);
                  navigate('/resident/reports');
                }}
                className="text-gray-400 hover:text-white border-none bg-transparent cursor-pointer p-1"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {selectedReport.photoUrl && (
              <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800 max-h-56">
                <img src={selectedReport.photoUrl} alt="Issue attachment" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="border-t border-b border-gray-100 dark:border-zinc-800 py-3.5 space-y-2">
              <span className="text-xs font-bold text-gray-400 block uppercase">Description & Justification:</span>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 m-0 whitespace-pre-wrap leading-relaxed">
                {selectedReport.description}
              </p>

              {selectedReport.resolutionNotes && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 p-3 rounded-xl mt-2 text-green-800 dark:text-green-300">
                  <span className="font-bold block text-xs">Official Administrative Response:</span>
                  <span className="text-xs mt-1 block">{selectedReport.resolutionNotes}</span>
                </div>
              )}
            </div>

            {/* Admin responses / messages history */}
            <div className="space-y-2.5">
              <h5 className="font-bold text-xs text-gray-900 dark:text-white m-0">
                Messages & Resolution Updates ({selectedReport.responses?.length || 0})
              </h5>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedReport.responses && selectedReport.responses.length > 0 ? (
                  selectedReport.responses.map((r, i) => (
                    <div key={i} className={`p-2.5 rounded-xl text-xs ${r.isAdminResponse ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/40' : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200'}`}>
                      <span className="font-bold block text-[10px] mb-0.5">{r.isAdminResponse ? '🏢 Administration Update' : '👤 You'}</span>
                      <span>{r.message}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-gray-400 m-0 py-2">No updates yet from property management.</p>
                )}
              </div>

              {/* Reply to admin */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={responseMsg}
                  onChange={(e) => setResponseMsg(e.target.value)}
                  placeholder="Send a follow-up note to management..."
                  className="flex-1 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={() => handleSendResponse(selectedReport.id)}
                  disabled={sendingResponse || !responseMsg.trim()}
                  className="bg-amber-400 hover:bg-amber-500 text-black px-4 py-2 rounded-xl font-bold text-xs border-none cursor-pointer disabled:opacity-50 transition"
                >
                  Send
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedReport(null);
                navigate('/resident/reports');
              }}
              className="w-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 font-bold p-3 rounded-xl text-xs transition border-none cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentReports;
