// src/components/chat/ItemTelegramChatModal.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
  Paper,
  Zoom,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  Chat as ChatIcon,
  LocationOn as LocationOnIcon,
  DoneAll as DoneAllIcon,
  Campaign as CampaignIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';

const getRoleColor = (role) => {
  switch (role) {
    case 'super_admin': return '#D3AD32';
    case 'condo_admin': return '#2563eb';
    case 'guard': return '#059669';
    default: return '#7c3aed';
  }
};

const getRoleBadge = (role, isReporter) => {
  if (isReporter) return 'Reporter';
  switch (role) {
    case 'super_admin': return 'Super Admin';
    case 'condo_admin': return 'Condo Admin';
    case 'guard': return 'Security';
    default: return 'Resident';
  }
};

const ItemTelegramChatModal = ({ open, onClose, item }) => {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Fetch full item discussion
  const fetchDiscussion = useCallback(async () => {
    if (!item?.id) return;
    try {
      setLoading(true);
      const data = await chatService.getItemDiscussion(item.id);
      setMessages(data.messages || []);
      setTimeout(() => scrollToBottom('auto'), 100);
    } catch (error) {
      console.error('Error loading item discussion:', error);
      toast.error('Failed to load item discussion');
    } finally {
      setLoading(false);
    }
  }, [item?.id]);

  useEffect(() => {
    if (!open || !item?.id) return;

    fetchDiscussion();

    // Connect to Socket.IO for real-time Telegram-style messages
    try {
      const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      
      const socket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('joinItemChat', item.id);
      });

      const handleIncomingMessage = (newMsg) => {
        if (newMsg && newMsg.lostFoundId === item.id) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          setTimeout(() => scrollToBottom(), 50);
        }
      };

      socket.on('newItemChatMessage', handleIncomingMessage);
      socket.on('itemChatMessage', handleIncomingMessage);

      return () => {
        socket.emit('leaveItemChat', item.id);
        socket.disconnect();
      };
    } catch (err) {
      console.warn('Socket connection warning:', err.message);
    }
  }, [open, item?.id, fetchDiscussion]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || sending || !item?.id) return;

    const content = input.trim();
    setInput('');
    setSending(true);

    try {
      const newMsg = await chatService.sendItemMessage(item.id, content);
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setTimeout(() => scrollToBottom(), 50);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
      setInput(content); // Restore draft on error
    } finally {
      setSending(false);
    }
  };

  if (!item) return null;

  const itemTitle = item.title || item.itemName || 'Community Item';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Zoom}
      PaperProps={{
        sx: {
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          height: '700px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Telegram-style Channel Header */}
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          p: 2.5,
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <Avatar
              sx={{
                bgcolor: item.type === 'lost' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                color: item.type === 'lost' ? '#ef4444' : '#22c55e',
                fontWeight: 700,
                width: 44,
                height: 44,
              }}
            >
              {item.type === 'lost' ? '🔍' : '📦'}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ color: '#fff', fontSize: '1.05rem' }}>
                  {itemTitle}
                </Typography>
                <Chip
                  label={item.type === 'lost' ? 'LOST' : 'FOUND'}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    height: 20,
                    fontSize: '0.65rem',
                    bgcolor: item.type === 'lost' ? '#ef4444' : '#22c55e',
                    color: '#fff',
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <span>Community Discussion</span>
                <span>•</span>
                <span>{messages.length} messages</span>
                {item.location && (
                  <>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <LocationOnIcon sx={{ fontSize: 13 }} /> {item.location}
                    </span>
                  </>
                )}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8', '&:hover': { color: '#fff' } }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Messages Stream (Telegram Background) */}
      <DialogContent
        sx={{
          p: 0,
          flexGrow: 1,
          bgcolor: '#eef2f6',
          backgroundImage: 'radial-gradient(rgba(0,0,0,0.03) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1 }}>
          {/* Welcome Announcement Pin */}
          <Paper
            elevation={0}
            sx={{
              p: 1.75,
              borderRadius: '12px',
              bgcolor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(0,0,0,0.06)',
              textAlign: 'center',
              mb: 1,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
              <CampaignIcon sx={{ fontSize: 16, color: '#D3AD32' }} /> COMMUNITY ITEM THREAD
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', lineHeight: 1.4 }}>
              This discussion is public to all verified residents and administrators. Anyone can send clues, verify ownership, or coordinate safe recovery.
            </Typography>
          </Paper>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', py: 8 }}>
              <CircularProgress size={32} sx={{ color: '#0284c7' }} />
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ textAlign: 'center', my: 'auto', py: 6, color: '#64748b' }}>
              <ChatIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
              <Typography variant="body2" fontWeight={600}>No messages yet</Typography>
              <Typography variant="caption">Be the first to leave a message or clue about this item!</Typography>
            </Box>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUser?.id;
              const sender = msg.sender || {};
              const isReporter = sender.id === item.userId || sender.id === item.user?.id;
              const senderRole = sender.role || 'resident';
              const roleColor = getRoleColor(senderRole);
              const roleBadge = getRoleBadge(senderRole, isReporter);

              return (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '100%',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      alignItems: 'flex-end',
                      maxWidth: { xs: '88%', sm: '80%' },
                      flexDirection: isMe ? 'row-reverse' : 'row',
                    }}
                  >
                    {!isMe && (
                      <Avatar
                        src={sender.profilePhoto}
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: roleColor,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          flexShrink: 0,
                          mb: 0.5,
                        }}
                      >
                        {sender.fullName?.charAt(0) || 'U'}
                      </Avatar>
                    )}

                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        px: 2,
                        borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        bgcolor: isMe ? '#2563eb' : '#ffffff',
                        color: isMe ? '#ffffff' : '#1e293b',
                        boxShadow: isMe ? '0 2px 8px rgba(37, 99, 235, 0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
                        wordBreak: 'break-word',
                      }}
                    >
                      {!isMe && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              color: roleColor,
                              fontSize: '0.78rem',
                            }}
                          >
                            {sender.fullName || 'Neighbor'}
                          </Typography>
                          <Chip
                            label={roleBadge}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.62rem',
                              fontWeight: 600,
                              bgcolor: isReporter ? '#fee2e2' : 'rgba(0,0,0,0.06)',
                              color: isReporter ? '#dc2626' : roleColor,
                              border: isReporter ? '1px solid #fca5a5' : 'none',
                            }}
                          />
                        </Box>
                      )}

                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.9rem',
                          lineHeight: 1.5,
                          whiteSpace: 'pre-wrap',
                          color: isMe ? '#ffffff' : '#1e293b',
                        }}
                      >
                        {msg.content}
                      </Typography>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.65rem',
                            color: isMe ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                          }}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                        {isMe && <DoneAllIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }} />}
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </Box>
      </DialogContent>

      {/* Telegram-style Input Footer */}
      <Box
        component="form"
        onSubmit={handleSend}
        sx={{
          p: 1.75,
          px: 2,
          bgcolor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Message this community thread (visible to everyone)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={sending}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '24px',
              bgcolor: '#f1f5f9',
              fontSize: '0.9rem',
              '& fieldset': { borderColor: 'transparent' },
              '&:hover fieldset': { borderColor: '#cbd5e1' },
              '&.Mui-focused fieldset': { borderColor: '#2563eb' },
            },
          }}
        />
        <IconButton
          type="submit"
          disabled={!input.trim() || sending}
          sx={{
            bgcolor: '#2563eb',
            color: '#fff',
            width: 42,
            height: 42,
            flexShrink: 0,
            '&:hover': { bgcolor: '#1d4ed8' },
            '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
            transition: 'all 0.2s ease',
          }}
        >
          {sending ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <SendIcon fontSize="small" />}
        </IconButton>
      </Box>
    </Dialog>
  );
};

export default ItemTelegramChatModal;
