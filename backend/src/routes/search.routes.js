import express from 'express';
import searchController from '../controllers/search.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { searchValidation } from '../middlewares/validator.js';

const router = express.Router();

/**
 * Search Routes
 */

// GET /api/search?q=query - Search across all content
router.get('/', authenticate, searchValidation, searchController.search);

export default router;
