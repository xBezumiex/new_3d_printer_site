import asyncHandler from '../utils/asyncHandler.js';
import * as svc from '../services/achievements.service.js';

export const getUserAchievements = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user.id;
  const data = await svc.getUserAchievements(userId);
  res.json({ success: true, data: { achievements: data, all: svc.ALL_ACHIEVEMENTS.map(a => a.type) } });
});
