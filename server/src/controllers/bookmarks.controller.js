import asyncHandler from '../utils/asyncHandler.js';
import * as svc from '../services/bookmarks.service.js';

export const toggleBookmark = asyncHandler(async (req, res) => {
  const data = await svc.toggleBookmark(req.params.postId, req.user.id);
  res.json({ success: true, data });
});
export const checkBookmark = asyncHandler(async (req, res) => {
  const data = await svc.checkBookmark(req.params.postId, req.user.id);
  res.json({ success: true, data });
});
export const getUserBookmarks = asyncHandler(async (req, res) => {
  const data = await svc.getUserBookmarks(req.user.id, req.query.page, req.query.limit);
  res.json({ success: true, data });
});
