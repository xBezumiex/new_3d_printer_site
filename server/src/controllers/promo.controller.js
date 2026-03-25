import asyncHandler from '../utils/asyncHandler.js';
import * as svc from '../services/promo.service.js';

export const validatePromo = asyncHandler(async (req, res) => {
  const data = await svc.validatePromo(req.body.code);
  res.json({ success: true, data });
});
export const createPromo = asyncHandler(async (req, res) => {
  const data = await svc.createPromo(req.body);
  res.status(201).json({ success: true, data });
});
export const getPromos = asyncHandler(async (req, res) => {
  const data = await svc.getPromos();
  res.json({ success: true, data });
});
export const togglePromo = asyncHandler(async (req, res) => {
  const data = await svc.togglePromo(req.params.id);
  res.json({ success: true, data });
});
export const deletePromo = asyncHandler(async (req, res) => {
  const data = await svc.deletePromo(req.params.id);
  res.json({ success: true, data });
});
