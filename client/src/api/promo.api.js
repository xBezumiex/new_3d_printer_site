import axiosInstance from './axios.js';

export const validatePromo = async (code) => {
  const r = await axiosInstance.post('/promo/validate', { code });
  return r.data;
};
export const getPromos = async () => {
  const r = await axiosInstance.get('/promo');
  return r.data;
};
export const createPromo = async (data) => {
  const r = await axiosInstance.post('/promo', data);
  return r.data;
};
export const togglePromo = async (id) => {
  const r = await axiosInstance.put(`/promo/${id}/toggle`);
  return r.data;
};
export const deletePromo = async (id) => {
  const r = await axiosInstance.delete(`/promo/${id}`);
  return r.data;
};
