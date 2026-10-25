// src/pages/resident/LostFound.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axiosConfig';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const ResidentLostFound = () => {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, lost, found

  // Active view: 'list' or 'discussion'
  const [activeItem, setActiveItem] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  
  // Multi-photo support in chat
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [sending, setSending] = useState(false);

  // Modal: Report Item
  const [openReportModal, setOpenReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    type: 'lost',
    category: 'electronics',
    location: '',
    contactPhone: user?.phoneNumber || '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [reportImageFiles, setReportImageFiles] = useState([]);
  const [reportPreviews, setReportPreviews] = useState([]);
  const [submittingReport, setSubmittingReport] = useState(false);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch real items
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.lostFound.getAll({ limit: 50 });
      const data = res.data?.data?.items || res.data?.data || res.data || [];
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching lost and found:', err);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Fetch discussion when activeItem changes
  useEffect(() => {
    if (!activeItem?.id) return;

    let isMounted = true;

    const loadDiscussion = async () => {
      try {
        setChatLoading(true);
        const res = await api.chat.getItemDiscussion(activeItem.id);
        const msgs = res.data?.data?.messages || res.data?.data || [];
        if (isMounted) {
          setMessages(Array.isArray(msgs) ? msgs : []);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      } catch (err) {
        console.error('Error loading item discussion:', err);
      } finally {
        if (isMounted) setChatLoading(false);
      }
    };

    loadDiscussion();

    // Socket.IO Setup
    try {
      const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const socket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('joinItemChat', activeItem.id);
      });

      const handleIncomingMessage = (newMsg) => {
        if (newMsg && (newMsg.lostFoundId === activeItem.id || String(newMsg.lostFoundId) === String(activeItem.id))) {
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }
      };

      socket.on('newItemChatMessage', handleIncomingMessage);
      socket.on('itemChatMessage', handleIncomingMessage);

      return () => {
        socket.disconnect();
      };
    } catch (e) {
      console.warn('Socket connection error in lost and found:', e);
    }

    return () => {
      isMounted = false;
    };
  }, [activeItem?.id]);

  // Handle multiple photos selection in chat
  const handleChatPhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.warning(`${file.name} is not an image file.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setPendingPhotos(prev => [...prev, uploadEvent.target.result]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const removePendingPhoto = (idxToRemove) => {
    setPendingPhotos(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // Send message in item discussion with multi-photo support
  const handleSendMessage = async () => {
    if ((!inputText.trim() && pendingPhotos.length === 0) || sending || !activeItem) return;

    try {
      setSending(true);

      let content;
      if (pendingPhotos.length > 0) {
        content = JSON.stringify({
          text: inputText.trim(),
          photos: pendingPhotos
        });
      } else {
        content = inputText.trim();
      }

      const payload = {
        lostFoundId: activeItem.id,
        content,
        type: pendingPhotos.length > 0 ? 'photo' : 'message',
        receiverId: activeItem.userId,
      };

      const res = await api.chat.sendMessage(payload);
      const savedMsg = res.data?.data || {
        id: Date.now().toString(),
        content,
        type: pendingPhotos.length > 0 ? 'photo' : 'message',
        senderId: user?.id,
        sender: { id: user?.id, fullName: user?.fullName, role: user?.role },
        createdAt: new Date().toISOString()
      };

      setMessages(prev => {
        if (prev.some(m => m.id === savedMsg.id)) return prev;
        return [...prev, savedMsg];
      });

      setInputText('');
      setPendingPhotos([]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Helper: Parse message content for text and multiple photos
  const parseMessageContent = (content, msgType) => {
    if (!content) return { text: '', photos: [] };

    if (typeof content === 'string' && (content.startsWith('{') || content.startsWith('{"'))) {
      try {
        const parsed = JSON.parse(content);
        if (parsed && (parsed.text !== undefined || Array.isArray(parsed.photos))) {
          return {
            text: parsed.text || '',
            photos: Array.isArray(parsed.photos) ? parsed.photos : (parsed.photo ? [parsed.photo] : [])
          };
        }
      } catch (e) {
        // Fallback to text
      }
    }

    if (msgType === 'photo' && (content.startsWith('data:image') || content.startsWith('http'))) {
      return { text: '', photos: [content] };
    }

    return { text: content, photos: [] };
  };

  // Handle multi-photos for Report Item Modal
  const handleReportImagesSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setReportImageFiles(files);
    const previews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        previews.push(ev.target.result);
        if (previews.length === files.length) {
          setReportPreviews([...previews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Submit new Lost / Found listing
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportForm.title.trim()) {
      toast.error('Please enter an item title');
      return;
    }

    try {
      setSubmittingReport(true);
      const formData = new FormData();
      formData.append('title', reportForm.title);
      formData.append('description', reportForm.description);
      formData.append('type', reportForm.type);
      formData.append('category', reportForm.category);
      formData.append('location', reportForm.location);
      formData.append('contactPhone', reportForm.contactPhone);
      formData.append('date', reportForm.date);
      if (reportImageFiles.length > 0) {
        formData.append('image', reportImageFiles[0]);
      }

      await api.lostFound.create(formData);
      toast.success('Lost & Found item reported successfully!');
      setOpenReportModal(false);
      setReportForm({
        title: '',
        description: '',
        type: 'lost',
        category: 'electronics',
        location: '',
        contactPhone: user?.phoneNumber || '',
        date: new Date().toISOString().slice(0, 10),
      });
      setReportImageFiles([]);
      setReportPreviews([]);
      fetchItems();
    } catch (err) {
      console.error('Report submission failed:', err);
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmittingReport(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      (item.title || item.itemName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || (item.type || '').toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  // -------------------------------------------------------------
  // RENDER DISCUSSION FEED VIEW (Live Chat with Multi-Photo Support)
  // -------------------------------------------------------------
  if (activeItem) {
    return (
      <div className="w-full max-w-4xl mx-auto h-[calc(100vh-140px)] min-h-[520px] flex flex-col bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-xl overflow-hidden relative transition-colors duration-200">
        
        {/* Discussion Header */}
        <div className="p-3 sm:p-4 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <button
              onClick={() => setActiveItem(null)}
              className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-95 rounded-xl border-none bg-transparent cursor-pointer flex items-center space-x-1"
              title="Return to items list"
            >
              <i className="fa-solid fa-arrow-left text-sm"></i>
              <span className="text-xs font-bold hidden sm:inline">Items</span>
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                  activeItem.type === 'found' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' 
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                }`}>
                  {activeItem.type || 'Lost'}
                </span>
                <h4 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white m-0 truncate max-w-[170px] sm:max-w-md">
                  {activeItem.title || activeItem.itemName}
                </h4>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 m-0 mt-0.5">
                {activeItem.location ? `📍 ${activeItem.location}` : 'Building Premises'} • Reported {new Date(activeItem.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300">
            {activeItem.status || 'Active'}
          </span>
        </div>

        {/* Scrollable Messages Area */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-3.5 bg-gray-50/50 dark:bg-zinc-950/40">
          
          {/* Pinned Item Context Box at Top of Feed */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 p-3.5 sm:p-4 rounded-2xl text-xs space-y-2 max-w-2xl mx-auto shadow-sm">
            <div className="flex justify-between items-start">
              <span className="font-extrabold text-amber-900 dark:text-amber-300 text-xs uppercase tracking-wide">
                Original Item Report
              </span>
              <span className="text-[10px] text-gray-400">
                Posted by {activeItem.user?.fullName || 'Resident Member'}
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 m-0 leading-relaxed">
              {activeItem.description}
            </p>

            {activeItem.image && (
              <img 
                src={activeItem.image} 
                alt="Reported item" 
                onClick={() => setLightboxImage(activeItem.image)}
                className="w-full max-h-52 object-cover rounded-xl mt-2 border border-amber-200 dark:border-amber-800/40 cursor-pointer hover:opacity-95 transition" 
                title="Click to view full photo"
              />
            )}

            {activeItem.contactPhone && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 m-0 pt-1">
                📞 Contact: <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{activeItem.contactPhone}</span>
              </p>
            )}
          </div>

          {/* Messages Feed */}
          {chatLoading ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              <i className="fa-solid fa-spinner fa-spin text-lg mb-1 text-amber-400"></i>
              <p className="m-0">Loading discussion feed...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs">
              <i className="fa-solid fa-comments text-3xl mb-2 text-gray-300 dark:text-zinc-700"></i>
              <p className="m-0">No discussion replies yet. If you have info or wish to claim this item, reply below!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === user?.id || msg.sender?.id === user?.id;
              const senderRole = msg.sender?.role;
              const { text, photos } = parseMessageContent(msg.content, msg.type);

              return (
                <div 
                  key={msg.id} 
                  className={`p-3 sm:p-4 rounded-2xl border shadow-sm max-w-[85%] sm:max-w-[75%] ${
                    isMine 
                      ? 'ml-auto bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700/50' 
                      : 'mr-auto bg-white dark:bg-zinc-850 border-gray-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className={`font-bold text-xs ${isMine ? 'text-amber-900 dark:text-amber-300' : 'text-gray-900 dark:text-white'}`}>
                      {isMine ? 'You' : (msg.sender?.fullName || 'Resident')}
                    </span>
                    {senderRole && senderRole !== 'resident' && (
                      <span className="text-[9px] uppercase font-bold bg-amber-400/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded">
                        {senderRole.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  {/* Multi-photo gallery inside chat message */}
                  {photos.length > 0 && (
                    <div className="my-2">
                      {photos.length === 1 ? (
                        <img 
                          src={photos[0]} 
                          alt="Attached photo" 
                          onClick={() => setLightboxImage(photos[0])}
                          className="w-full max-h-60 object-cover rounded-xl cursor-pointer hover:opacity-90 transition shadow-sm border border-black/10" 
                          title="Click to zoom"
                        />
                      ) : photos.length === 2 ? (
                        <div className="grid grid-cols-2 gap-1.5">
                          {photos.map((photo, pIdx) => (
                            <img 
                              key={pIdx} 
                              src={photo} 
                              alt={`Attached ${pIdx + 1}`} 
                              onClick={() => setLightboxImage(photo)}
                              className="w-full h-32 sm:h-40 object-cover rounded-xl cursor-pointer hover:opacity-90 transition shadow-sm border border-black/10" 
                              title="Click to zoom"
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                          {photos.map((photo, pIdx) => (
                            <img 
                              key={pIdx} 
                              src={photo} 
                              alt={`Attached ${pIdx + 1}`} 
                              onClick={() => setLightboxImage(photo)}
                              className="w-full h-24 sm:h-28 object-cover rounded-xl cursor-pointer hover:opacity-90 transition shadow-sm border border-black/10" 
                              title="Click to zoom"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Text */}
                  {text && (
                    <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 m-0 whitespace-pre-wrap leading-relaxed">
                      {text}
                    </p>
                  )}

                  <p className="text-[9px] text-gray-400 dark:text-gray-500 text-right mt-1 m-0 font-mono">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Pending Photos Preview Strip (Above Composer) */}
        {pendingPhotos.length > 0 && (
          <div className="p-2 sm:p-2.5 bg-amber-50/80 dark:bg-zinc-800/90 border-t border-amber-200 dark:border-zinc-800 flex items-center space-x-2 overflow-x-auto shrink-0">
            <span className="text-[10px] font-extrabold uppercase text-amber-700 dark:text-amber-400 shrink-0 px-1">
              {pendingPhotos.length} Attached:
            </span>
            {pendingPhotos.map((photo, idx) => (
              <div key={idx} className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 border border-amber-400 shadow-sm group">
                <img src={photo} alt="Pending thumbnail" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePendingPhoto(idx)}
                  className="absolute top-0.5 right-0.5 bg-black/80 hover:bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] border-none cursor-pointer transition"
                  title="Remove photo"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Sticky Chat Composer Bar with Multi-Photo Attachment */}
        <div className="p-2.5 sm:p-3 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 flex items-center space-x-2 shrink-0">
          
          {/* Multiple Photo Upload Button */}
          <label 
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-amber-400 hover:text-black text-gray-600 dark:text-gray-300 flex items-center justify-center transition cursor-pointer shrink-0 active:scale-95"
            title="Attach photos (multiple supported)"
          >
            <i className="fa-solid fa-camera text-sm"></i>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleChatPhotoSelect} 
              className="hidden" 
            />
          </label>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={pendingPhotos.length > 0 ? "Add message or send photos..." : "Reply to item or share details..."}
            className="flex-1 bg-gray-100 dark:bg-zinc-800 border-0 rounded-full px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-900 dark:text-white"
          />

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={sending || (!inputText.trim() && pendingPhotos.length === 0)}
            className="bg-amber-400 hover:bg-amber-500 active:scale-95 text-black px-3.5 sm:px-4 py-2 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition border-none cursor-pointer disabled:opacity-50 space-x-1.5 shadow"
          >
            <span>Send</span>
            <i className="fa-solid fa-paper-plane text-xs"></i>
          </button>
        </div>

        {/* Full-Screen Photo Lightbox Modal */}
        {lightboxImage && (
          <div 
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in"
            onClick={() => setLightboxImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
              <img 
                src={lightboxImage} 
                alt="Enlarged photo preview" 
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" 
              />
              <button 
                onClick={() => setLightboxImage(null)}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer text-base"
                title="Close"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER ITEMS LIST VIEW
  // -------------------------------------------------------------
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white m-0">
            Lost & Found Community Hub
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 m-0 mt-0.5">
            Search missing belongings, browse community recoveries, and connect via chat
          </p>
        </div>
        <button
          onClick={() => setOpenReportModal(true)}
          className="bg-amber-400 hover:bg-amber-500 active:scale-95 text-black text-xs sm:text-sm font-extrabold px-4 py-2.5 rounded-xl flex items-center justify-center space-x-2 shadow transition border-none cursor-pointer self-start sm:self-auto"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>Report Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items by name, description, location..."
            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm dark:text-white focus:outline-none focus:border-amber-400 shadow-sm"
          />
        </div>

        <div className="flex space-x-2 shrink-0 overflow-x-auto pb-0.5">
          {['all', 'lost', 'found'].map((tKey) => {
            const isActive = filterType === tKey;
            return (
              <button
                key={tKey}
                onClick={() => setFilterType(tKey)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition border-none cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-black text-amber-400 shadow-sm'
                    : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800 hover:border-amber-400'
                }`}
              >
                {tKey === 'all' ? 'All Items' : tKey}
              </button>
            );
          })}
        </div>
      </div>

      {/* Items Responsive Grid */}
      <div>
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            <i className="fa-solid fa-spinner fa-spin text-2xl mb-2 text-amber-400"></i>
            <p className="m-0">Loading community listings...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8 text-gray-400">
            <i className="fa-solid fa-box-open text-4xl mb-3 text-gray-300 dark:text-zinc-700"></i>
            <h4 className="font-bold text-gray-700 dark:text-gray-300 text-base m-0">No Items Found</h4>
            <p className="text-xs text-gray-400 mt-1 m-0">No listings match your search criteria. Report an item if you lost or found something!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-amber-400 transition flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.title || item.itemName} 
                      className="w-full h-44 object-cover border-b border-gray-100 dark:border-zinc-800"
                    />
                  )}
                  <div className="p-4 sm:p-5">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        item.type === 'found' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                      }`}>
                        {item.type || 'Lost'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white m-0">
                      {item.title || item.itemName}
                    </h4>

                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-3 m-0 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-3 flex items-center text-xs text-gray-400 gap-1.5">
                      <i className="fa-solid fa-location-dot text-amber-500"></i>
                      <span className="truncate">{item.location || 'Building Grounds'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 sm:p-5 sm:pt-0">
                  <button
                    onClick={() => setActiveItem(item)}
                    className="w-full bg-gray-100 hover:bg-amber-400 dark:bg-zinc-800 dark:hover:bg-amber-400 text-gray-800 dark:text-white hover:text-black font-extrabold p-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-2 border-none cursor-pointer active:scale-95"
                  >
                    <i className="fa-solid fa-comments text-xs"></i>
                    <span>Open Discussion & Photos</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: REPORT ITEM */}
      {openReportModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-zinc-800">
              <div>
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white m-0">Report Lost or Found Item</h3>
                <p className="text-xs text-gray-400 m-0">Broadcast to your condominium community</p>
              </div>
              <button 
                onClick={() => setOpenReportModal(false)}
                className="text-gray-400 hover:text-white border-none bg-transparent cursor-pointer p-1"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReportForm({ ...reportForm, type: 'lost' })}
                  className={`p-2.5 rounded-xl font-bold transition border-none cursor-pointer ${
                    reportForm.type === 'lost' 
                      ? 'bg-amber-400 text-black shadow' 
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <i className="fa-solid fa-magnifying-glass mr-1"></i> I Lost an Item
                </button>
                <button
                  type="button"
                  onClick={() => setReportForm({ ...reportForm, type: 'found' })}
                  className={`p-2.5 rounded-xl font-bold transition border-none cursor-pointer ${
                    reportForm.type === 'found' 
                      ? 'bg-green-500 text-white shadow' 
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <i className="fa-solid fa-hand-holding mr-1"></i> I Found an Item
                </button>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Item Title</label>
                <input
                  type="text"
                  required
                  value={reportForm.title}
                  onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                  placeholder="e.g. Black Leather Wallet / Keychain"
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Category</label>
                  <select
                    value={reportForm.category}
                    onChange={(e) => setReportForm({ ...reportForm, category: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white text-xs"
                  >
                    <option value="electronics">📱 Electronics & Devices</option>
                    <option value="accessories">👜 Wallets, Bags & Jewelry</option>
                    <option value="keys">🔑 Keys & Badges</option>
                    <option value="documents">📄 IDs & Documents</option>
                    <option value="clothing">👕 Clothing & Footwear</option>
                    <option value="other">📦 Other Items</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Location</label>
                  <input
                    type="text"
                    value={reportForm.location}
                    onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                    placeholder="e.g. Block B, 2nd floor corridor"
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Description & Distinctive Features</label>
                <textarea
                  rows="3"
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  placeholder="Describe color, brand, contents, or unique markings..."
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white text-xs resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Contact Phone</label>
                  <input
                    type="text"
                    value={reportForm.contactPhone}
                    onChange={(e) => setReportForm({ ...reportForm, contactPhone: e.target.value })}
                    placeholder="+251 911 234 567"
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Date Incident Occurred</label>
                  <input
                    type="date"
                    value={reportForm.date}
                    onChange={(e) => setReportForm({ ...reportForm, date: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Photo Attachment (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleReportImagesSelect}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2 dark:text-white text-xs"
                />
                {reportPreviews.length > 0 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                    {reportPreviews.map((p, idx) => (
                      <img key={idx} src={p} alt="Preview" className="w-14 h-14 object-cover rounded-xl border border-amber-400" />
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="w-full bg-amber-400 hover:bg-amber-500 active:scale-95 text-black font-extrabold p-3 rounded-xl text-sm shadow transition border-none cursor-pointer"
                >
                  {submittingReport ? 'Submitting Report...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentLostFound;