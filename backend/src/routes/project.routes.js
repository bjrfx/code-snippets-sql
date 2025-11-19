import express from 'express';
import projectController from '../controllers/project.controller.js';
import snippetController from '../controllers/snippet.controller.js';
import noteController from '../controllers/note.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { createProjectValidation } from '../middlewares/validator.js';

const router = express.Router();

/**
 * Project Routes
 * All routes require authentication
 */

// GET /api/projects - Get all projects for current user
router.get('/', authenticate, projectController.getUserProjects);

// GET /api/projects/:id - Get project by ID
router.get('/:id', authenticate, projectController.getProjectById);

// GET /api/projects/:id/stats - Get project statistics
router.get('/:id/stats', authenticate, projectController.getProjectStats);

// POST /api/projects - Create new project
router.post('/', authenticate, createProjectValidation, projectController.createProject);

// PATCH /api/projects/:id - Update project
router.patch('/:id', authenticate, projectController.updateProject);

// DELETE /api/projects/:id - Delete project
router.delete('/:id', authenticate, projectController.deleteProject);

// GET /api/projects/:projectId/snippets - Get snippets by project
router.get('/:projectId/snippets', authenticate, snippetController.getSnippetsByProject);

// GET /api/projects/:projectId/notes - Get notes by project
router.get('/:projectId/notes', authenticate, noteController.getNotesByProject);

export default router;
