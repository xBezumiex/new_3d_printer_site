// Контроллеры для поиска
import * as searchService from '../services/search.service.js';
import asyncHandler from '../utils/asyncHandler.js';

// Поиск
export const search = asyncHandler(async (req, res) => {
  const { q, type = 'all', limit = 10 } = req.query;

  let result;

  switch (type) {
    case 'posts':
      const posts = await searchService.searchPosts(q, limit);
      result = { posts, total: posts.length };
      break;

    case 'users':
      const users = await searchService.searchUsers(q, limit);
      result = { users, total: users.length };
      break;

    case 'all':
    default:
      result = await searchService.searchAll(q, limit);
      break;
  }

  res.json({
    status: 'success',
    data: result,
  });
});
