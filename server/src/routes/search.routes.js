// Роуты для поиска
import express from 'express';
import * as searchController from '../controllers/search.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { searchQuerySchema } from '../validators/search.validator.js';

const router = express.Router();

// Поиск (публичный)
router.get('/', validate(searchQuerySchema, 'query'), searchController.search);

export default router;
