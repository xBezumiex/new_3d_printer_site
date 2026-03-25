import asyncHandler from '../utils/asyncHandler.js';
import * as messagesService from '../services/messages.service.js';

export const getConversations = asyncHandler(async (req, res) => {
  const data = await messagesService.getConversations(req.user.id);
  res.json({ success: true, data });
});

export const getMessages = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const data = await messagesService.getMessages(req.user.id, userId, page, limit);
  res.json({ success: true, data });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { text, imageUrl } = req.body;
  const message = await messagesService.sendMessage(req.user.id, userId, text, imageUrl);
  res.status(201).json({ success: true, data: message });
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const result = await messagesService.deleteMessage(messageId, req.user.id);
  res.json({ success: true, data: result });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const data = await messagesService.getUnreadCount(req.user.id);
  res.json({ success: true, data });
});
