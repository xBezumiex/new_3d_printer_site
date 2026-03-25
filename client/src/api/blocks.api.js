import axiosInstance from './axios.js';

export const blockUser = async (userId) => {
  const r = await axiosInstance.post(`/blocks/${userId}`);
  return r.data;
};

export const unblockUser = async (userId) => {
  const r = await axiosInstance.delete(`/blocks/${userId}`);
  return r.data;
};

export const checkBlock = async (userId) => {
  const r = await axiosInstance.get(`/blocks/${userId}/check`);
  return r.data;
};

export const getBlockedUsers = async () => {
  const r = await axiosInstance.get('/blocks');
  return r.data;
};
