import axiosInstance from './axios.js';

export const getNotifications = async (page = 1) => {
  const r = await axiosInstance.get('/notifications', { params: { page } });
  return r.data;
};
export const getUnreadCount = async () => {
  const r = await axiosInstance.get('/notifications/unread');
  return r.data;
};
export const markOneRead = async (id) => {
  const r = await axiosInstance.put(`/notifications/${id}/read`);
  return r.data;
};
export const markAllRead = async () => {
  const r = await axiosInstance.put('/notifications/read-all');
  return r.data;
};
export const deleteNotification = async (id) => {
  const r = await axiosInstance.delete(`/notifications/${id}`);
  return r.data;
};
