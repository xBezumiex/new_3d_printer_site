// Контроллеры для постов
import * as postsService from '../services/posts.service.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Создать пост
// @route   POST /api/posts
// @access  Private
export const createPost = asyncHandler(async (req, res) => {
  const post = await postsService.createPost(req.user.id, req.body);

  res.status(201).json({
    status: 'success',
    data: { post },
  });
});

// @desc    Получить список постов
// @route   GET /api/posts
// @access  Public
export const getPosts = asyncHandler(async (req, res) => {
  const result = await postsService.getPosts(req.query);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

// @desc    Получить пост по ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = asyncHandler(async (req, res) => {
  const post = await postsService.getPostById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { post },
  });
});

// @desc    Обновить пост
// @route   PUT /api/posts/:id
// @access  Private (автор или админ)
export const updatePost = asyncHandler(async (req, res) => {
  const post = await postsService.updatePost(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body
  );

  res.status(200).json({
    status: 'success',
    data: { post },
  });
});

// @desc    Удалить пост
// @route   DELETE /api/posts/:id
// @access  Private (автор или админ)
export const deletePost = asyncHandler(async (req, res) => {
  const result = await postsService.deletePost(req.params.id, req.user.id, req.user.role);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

// @desc    Лайк поста
// @route   PATCH /api/posts/:id/like
// @access  Private
export const likePost = asyncHandler(async (req, res) => {
  const { increment } = req.body; // true — лайк, false — дизлайк
  const result = await postsService.likePost(req.params.id, increment !== false);
  res.status(200).json({ status: 'success', data: result });
});

// @desc    Добавить изображения к посту
// @route   POST /api/posts/:id/images
// @access  Private (автор)
export const addImagesToPost = asyncHandler(async (req, res) => {
  const { imageUrls } = req.body;

  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Необходимо предоставить массив URL изображений',
    });
  }

  const post = await postsService.addImagesToPost(req.params.id, req.user.id, imageUrls);

  res.status(200).json({
    status: 'success',
    data: { post },
  });
});

// @desc    Получить комментарии поста
// @route   GET /api/posts/:id/comments
// @access  Public
export const getComments = asyncHandler(async (req, res) => {
  const comments = await postsService.getComments(req.params.id);
  res.status(200).json({ status: 'success', data: { comments } });
});

// @desc    Добавить комментарий
// @route   POST /api/posts/:id/comments
// @access  Private
export const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ status: 'fail', message: 'Текст комментария обязателен' });
  }
  const comment = await postsService.addComment(req.params.id, req.user.id, text.trim());
  res.status(201).json({ status: 'success', data: { comment } });
});

// @desc    Удалить комментарий
// @route   DELETE /api/posts/comments/:commentId
// @access  Private (автор или админ)
export const deleteComment = asyncHandler(async (req, res) => {
  const result = await postsService.deleteComment(req.params.commentId, req.user.id, req.user.role);
  res.status(200).json({ status: 'success', data: result });
});

// @desc    Удалить изображение из поста
// @route   DELETE /api/posts/images/:imageId
// @access  Private (автор или админ)
export const deleteImageFromPost = asyncHandler(async (req, res) => {
  const result = await postsService.deleteImageFromPost(
    req.params.imageId,
    req.user.id,
    req.user.role
  );

  res.status(200).json({
    status: 'success',
    data: result,
  });
});


import prisma from '../config/database.js';
export const getTags = asyncHandler(async (req, res) => {
  const posts = await prisma.post.findMany({ select: { tags: true } });
  const allTags = [...new Set(posts.flatMap(p => p.tags))].sort();
  res.json({ success: true, data: { tags: allTags } });
});
