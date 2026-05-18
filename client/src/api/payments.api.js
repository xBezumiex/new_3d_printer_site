import axios from './axios';

export const createPayment = async ({ orderId, method }) => {
  const response = await axios.post('/payments/create', { orderId, method });
  return response.data;
};

export const getPaymentStatus = async (paymentId) => {
  const response = await axios.get(`/payments/${paymentId}`);
  return response.data;
};
