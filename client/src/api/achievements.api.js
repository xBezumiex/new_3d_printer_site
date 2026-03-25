import axiosInstance from './axios.js';

export const getUserAchievements = async (userId) => {
  const url = userId ? `/achievements/${userId}` : '/achievements/me';
  const r = await axiosInstance.get(url);
  return r.data;
};
