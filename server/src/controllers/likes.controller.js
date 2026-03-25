import asyncHandler from '../utils/asyncHandler.js';
import * as svc from '../services/likes.service.js';

export const toggleLike = asyncHandler(async (req, res) => {
  const data = await svc.toggleLike(req.params.postId, req.user.id);
  res.json({ success: true, data });
});
export const checkLike = asyncHandler(async (req, res) => {
  const data = await svc.checkLike(req.params.postId, req.user.id);
  res.json({ success: true, data });
});
