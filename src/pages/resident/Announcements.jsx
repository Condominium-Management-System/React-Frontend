// src/pages/resident/Announcements.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const ResidentAnnouncements = () => {
  const { id: urlNoticeId } = useParams();
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.announcements.getAll({ limit: 50 });
      const list = res.data?.data?.items || res.data?.data || res.data || [];
      const safeList = Array.isArray(list) ? list : [];
      setAnnouncements(safeList);

      if (urlNoticeId && safeList.length > 0) {
        const found = safeList.find(a => a.id === urlNoticeId);
        if (found) {
          handleSelectAnnouncement(found);
        }
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnnouncement = async (ann) => {
    setSelectedAnnouncement(ann);
    navigate(`/resident/announcements/${ann.id}`);

    if (!ann.isRead) {
      try {
        const res = await api.announcements.markRead(ann.id);
        const newUnreadCount = res.data?.data?.unreadCount ?? 0;
        setAnnouncements(prev => prev.map(item => item.id === ann.id ? { ...item, isRead: true } : item));
        window.dispatchEvent(new CustomEvent('ha_announcements_read', { detail: { unreadCount: newUnreadCount } }));
      } catch (err) {
        console.error('Failed to mark announcement as read:', err);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.announcements.markAllRead();
      setAnnouncements(prev => prev.map(item => ({ ...item, isRead: true })));
      window.dispatchEvent(new CustomEvent('ha_announcements_read', { detail: { unreadCount: 0 } }));
      toast.success('All notices marked as read');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      toast.error('Failed to mark all as read');
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [urlNoticeId]);

  const categories = ['all', 'emergency', 'maintenance', 'water', 'electric', 'general', 'financial'];

  const filteredAnnouncements = announcements.filter((ann) => {
    if (categoryFilter === 'all') return true;
    const cat = (ann.announcementType || ann.category || '').toLowerCase();
    const prio = (ann.priority || '').toLowerCase();
    return cat === categoryFilter || prio === categoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white m-0">
            Community Alerts & Official Notices
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 m-0 mt-0.5">
            Administrative broadcasts, utility advisories, and building emergency notices
          </p>
        </div>
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={handleMarkAllRead}
            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold hover:border-amber-400 transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
          >
            <i className="fa-solid fa-check-double text-xs text-amber-500"></i>
            <span>Mark All Read</span>
          </button>
          <button
            onClick={fetchAnnouncements}
            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold hover:border-amber-400 transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
          >
            <i className="fa-solid fa-arrows-rotate text-xs"></i>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex space-x-2 overflow-x-auto pb-1">
        {categories.map((catKey) => {
          const isActive = categoryFilter === catKey;
          return (
            <button
              key={catKey}
              onClick={() => setCategoryFilter(catKey)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition border-none cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-black text-amber-400 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800 hover:border-amber-400'
              }`}
            >
              {catKey === 'all' ? 'All Notices' : catKey}
            </button>
          );
        })}
      </div>

      {/* Responsive Announcements Grid */}
      <div>
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            <i className="fa-solid fa-spinner fa-spin text-2xl mb-2 text-amber-400"></i>
            <p className="m-0">Loading official bulletins...</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8 text-gray-400">
            <i className="fa-solid fa-bullhorn text-4xl mb-3 text-gray-300 dark:text-zinc-700"></i>
            <h4 className="font-bold text-gray-700 dark:text-gray-300 text-base m-0">No Active Notices</h4>
            <p className="text-xs text-gray-400 mt-1 m-0">No announcements match the selected category. Everything is operating normally.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAnnouncements.map((ann) => {
              const typeLower = (ann.announcementType || ann.category || '').toLowerCase();
              const isUrgent = ann.priority === 'emergency' || ann.priority === 'high' || typeLower === 'emergency';
              const bodyText = ann.body || ann.content || ann.description || 'No description provided.';
              
              return (
                <div
                  key={ann.id}
                  onClick={() => handleSelectAnnouncement(ann)}
                  className={`bg-white dark:bg-zinc-900 p-5 rounded-2xl border shadow-sm relative overflow-hidden cursor-pointer hover:border-amber-400 transition flex flex-col justify-between ${
                    isUrgent ? 'border-red-400/80 dark:border-red-500/80 shadow-red-500/10' : 'border-gray-200 dark:border-zinc-800'
                  }`}
                >
                  {isUrgent && (
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider shadow">
                      <i className="fa-solid fa-triangle-exclamation mr-1"></i> Urgent Alert
                    </div>
                  )}

                  <div>
                    <div className="flex items-start space-x-3 mb-3">
                      <div className={`p-3 rounded-2xl shrink-0 ${
                        isUrgent 
                          ? 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400' 
                          : 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                      }`}>
                        <i className={`fa-solid ${isUrgent ? 'fa-triangle-exclamation' : 'fa-bullhorn'} text-lg`}></i>
                      </div>
                      <div className="flex-1 pr-14">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                            {ann.announcementType || ann.category || 'Announcement'}
                          </span>
                          {!ann.isRead && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-extrabold text-[9px] uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                              <span>New</span>
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white m-0 mt-0.5 leading-snug">
                          {ann.title}
                        </h4>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 m-0 line-clamp-3 leading-relaxed">
                      {bodyText}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Published {new Date(ann.createdAt).toLocaleDateString()}</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center space-x-1">
                      <span>Read More</span>
                      <i className="fa-solid fa-arrow-right text-[10px]"></i>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-400">
                  {selectedAnnouncement.announcementType || selectedAnnouncement.category || 'Official Bulletin'}
                </span>
                <h3 className="font-black text-lg text-gray-900 dark:text-white m-0 mt-1.5">
                  {selectedAnnouncement.title}
                </h3>
                <p className="text-xs text-gray-400 m-0 mt-0.5">
                  Issued on {new Date(selectedAnnouncement.createdAt).toLocaleDateString()} by Condominium Administration
                </p>
              </div>
              <button 
                onClick={() => {
                  setSelectedAnnouncement(null);
                  navigate('/resident/announcements');
                }}
                className="text-gray-400 hover:text-white border-none bg-transparent cursor-pointer p-1"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="border-t border-b border-gray-100 dark:border-zinc-800 py-4 max-h-[60vh] overflow-y-auto">
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 m-0 whitespace-pre-wrap leading-relaxed">
                {selectedAnnouncement.body || selectedAnnouncement.content || selectedAnnouncement.description || 'No description provided.'}
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedAnnouncement(null);
                navigate('/resident/announcements');
              }}
              className="w-full bg-amber-400 hover:bg-amber-500 text-black font-extrabold p-3 rounded-xl text-xs sm:text-sm transition border-none cursor-pointer"
            >
              Close Notice
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentAnnouncements;
