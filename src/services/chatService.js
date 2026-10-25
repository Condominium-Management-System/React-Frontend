// src/services/chatService.js
import { api } from '../api/axiosConfig';

export const chatService = {
  getConversations: async () => {
    try {
      const response = await api.chat.getConversations();
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  getMessages: async (partnerId, lostFoundId = null) => {
    try {
      const params = lostFoundId ? { lostFoundId } : {};
      const response = await api.chat.getMessages(partnerId, params);
      return response.data?.data || { messages: [], partner: null, item: null };
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Telegram-style public item discussion for Lost & Found
  getItemDiscussion: async (lostFoundId) => {
    try {
      const response = await api.chat.getItemDiscussion(lostFoundId);
      return response.data?.data || { item: null, messages: [] };
    } catch (error) {
      console.error('Error fetching item discussion:', error);
      throw error;
    }
  },

  sendItemMessage: async (lostFoundId, content) => {
    try {
      const response = await api.chat.sendMessage({
        lostFoundId,
        content: content.trim(),
        type: 'message'
      });
      return response.data?.data;
    } catch (error) {
      console.error('Error sending item message:', error);
      throw error;
    }
  },

  sendMessage: async (data) => {
    try {
      const response = await api.chat.sendMessage(data);
      return response.data?.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  markAsRead: async (messageId) => {
    try {
      const response = await api.chat.markAsRead(messageId);
      return response.data?.data;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }
};
