import asyncHandler from '../utils/asyncHandler.js';
import * as svc from '../services/notifications.service.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const data = await svc.getNotifications(req.user.id, req.query.page, req.query.limit);
  res.json({ success: true, data });
});
export const getUnreadCount = asyncHandler(async (req, res) => {
  const data = await svc.getUnreadCount(req.user.id);
  res.json({ success: true, data });
});
export const markOneRead = asyncHandler(async (req, res) => {
  const data = await svc.markOneRead(req.params.id, req.user.id);
  res.json({ success: true, data });
});
export const markAllRead = asyncHandler(async (req, res) => {
  const data = await svc.markAllRead(req.user.id);
  res.json({ success: true, data });
});
export const deleteNotification = asyncHandler(async (req, res) => {
  const data = await svc.deleteNotification(req.params.id, req.user.id);
  res.json({ success: true, data });
});
