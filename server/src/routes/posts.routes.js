// Маршруты для постов
import express from 'express';
import * as postsController from '../controllers/posts.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createPostSchema,
  updatePostSchema,
  getPostsQuerySchema,
} from '../validators/posts.validator.js';
import likesRouter from './likes.routes.js';

const router = express.Router();

// Теги (до /:id чтобы не перехватывался)
router.get('/tags/list', postsController.getTags);

// Публичные маршруты
router.get('/', validate(getPostsQuerySchema, 'query'), postsController.getPosts);
router.get('/:id', postsController.getPostById);

// Защищенные маршруты (требуют авторизации)
router.post('/', authenticate, validate(createPostSchema), postsController.createPost);
router.put('/:id', authenticate, validate(updatePostSchema), postsController.updatePost);
router.delete('/:id', authenticate, postsController.deletePost);

// Лайк поста (legacy counter)
router.patch('/:id/like', authenticate, postsController.likePost);
// Новые лайки через PostLike таблицу
router.use('/:postId/likes', likesRouter);

// Комментарии
router.get('/:id/comments', postsController.getComments);
router.post('/:id/comments', authenticate, postsController.addComment);
router.delete('/comments/:commentId', authenticate, postsController.deleteComment);

// Работа с изображениями
router.post('/:id/images', authenticate, postsController.addImagesToPost);
router.delete('/images/:imageId', authenticate, postsController.deleteImageFromPost);

export default router;
