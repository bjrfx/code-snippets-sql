import express from 'express';
import snippetController from '../controllers/snippet.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { createSnippetValidation, updateSnippetValidation } from '../middlewares/validator.js';

const router = express.Router();

/**
 * Snippet Routes
 * All routes require authentication
 */

// GET /api/snippets - Get all snippets for current user
router.get('/', authenticate, snippetController.getUserSnippets);

// GET /api/snippets/:id - Get snippet by ID
router.get('/:id', authenticate, snippetController.getSnippetById);

// POST /api/snippets - Create new snippet
router.post('/', authenticate, createSnippetValidation, snippetController.createSnippet);

// PATCH /api/snippets/:id - Update snippet
router.patch('/:id', authenticate, updateSnippetValidation, snippetController.updateSnippet);

// DELETE /api/snippets/:id - Delete snippet
router.delete('/:id', authenticate, snippetController.deleteSnippet);

export default router;
