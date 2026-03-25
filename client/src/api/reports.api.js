import axiosInstance from './axios.js';

export const createReport = async ({ targetType, targetId, reason }) => {
  const r = await axiosInstance.post('/reports', { targetType, targetId, reason });
  return r.data;
};
export const getReports = async (params = {}) => {
  const r = await axiosInstance.get('/reports', { params });
  return r.data;
};
export const updateReportStatus = async (id, status) => {
  const r = await axiosInstance.put(`/reports/${id}`, { status });
  return r.data;
};
