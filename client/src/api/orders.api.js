// API для заказов
import axios from './axios';

export const createOrder = async (orderData) => {
  const response = await axios.post('/orders', orderData);
  return response.data;
};

export const getOrders = async (params = {}) => {
  const response = await axios.get('/orders', { params });
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await axios.get(`/orders/${orderId}`);
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await axios.put(`/orders/${orderId}/status`, { status });
  return response.data;
};

export const deleteOrder = async (orderId) => {
  const response = await axios.delete(`/orders/${orderId}`);
  return response.data;
};

export const getOrdersStats = async () => {
  const response = await axios.get('/orders/stats');
  return response.data;
};
