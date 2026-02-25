// Контроллеры для подписок
import * as subscriptionsService from '../services/subscriptions.service.js';
import asyncHandler from '../utils/asyncHandler.js';

// Подписаться
export const subscribe = asyncHandler(async (req, res) => {
  const { subscribedToId } = req.body;
  const subscriberId = req.user.id;

  const subscription = await subscriptionsService.subscribe(subscriberId, subscribedToId);

  res.status(201).json({
    status: 'success',
    data: { subscription },
  });
});

// Отписаться
export const unsubscribe = asyncHandler(async (req, res) => {
  const { id: subscribedToId } = req.params;
  const subscriberId = req.user.id;

  const result = await subscriptionsService.unsubscribe(subscriberId, subscribedToId);

  res.json({
    status: 'success',
    data: result,
  });
});

// Получить подписчиков
export const getFollowers = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;

  const followers = await subscriptionsService.getFollowers(userId);

  res.json({
    status: 'success',
    data: { followers },
  });
});

// Получить подписки
export const getFollowing = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;

  const following = await subscriptionsService.getFollowing(userId);

  res.json({
    status: 'success',
    data: { following },
  });
});

// Проверить статус подписки
export const checkFollowing = asyncHandler(async (req, res) => {
  const { id: subscribedToId } = req.params;
  const subscriberId = req.user.id;

  const isFollowing = await subscriptionsService.isFollowing(subscriberId, subscribedToId);

  res.json({
    status: 'success',
    data: { isFollowing },
  });
});
