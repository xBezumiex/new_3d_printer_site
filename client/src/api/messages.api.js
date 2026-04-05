import axiosInstance from './axios.js';

export const getConversations = async () => {
  const r = await axiosInstance.get('/messages');
  return r.data;
};

export const getMessages = async (userId, page = 1) => {
  const r = await axiosInstance.get(`/messages/${userId}`, { params: { page } });
  return r.data;
};

export const sendMessage = async (userId, { text, imageUrl }) => {
  const r = await axiosInstance.post(`/messages/${userId}`, { text, imageUrl });
  return r.data;
};

export const deleteMessage = async (messageId) => {
  const r = await axiosInstance.delete(`/messages/${messageId}`);
  return r.data;
};

export const getUnreadCount = async () => {
  const r = await axiosInstance.get('/messages/unread', { _noRetry: true });
  return r.data;
};
