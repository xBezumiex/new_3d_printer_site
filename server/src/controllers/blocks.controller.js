import asyncHandler from '../utils/asyncHandler.js';
import * as blocksService from '../services/blocks.service.js';

export const blockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const data = await blocksService.blockUser(req.user.id, userId);
  res.status(201).json({ success: true, data });
});

export const unblockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const data = await blocksService.unblockUser(req.user.id, userId);
  res.json({ success: true, data });
});

export const checkBlock = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const data = await blocksService.checkBlock(req.user.id, userId);
  res.json({ success: true, data });
});

export const getBlockedUsers = asyncHandler(async (req, res) => {
  const data = await blocksService.getBlockedUsers(req.user.id);
  res.json({ success: true, data });
});
