import express from 'express';
import snippetController from '../controllers/snippet.controller.js';
import noteController from '../controllers/note.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * Folder Routes
 * All routes require authentication
 */

// GET /api/folders/:folderId/snippets - Get snippets by folder
router.get('/:folderId/snippets', authenticate, snippetController.getSnippetsByFolder);

// GET /api/folders/:folderId/notes - Get notes by folder
router.get('/:folderId/notes', authenticate, noteController.getNotesByFolder);

// You can add more folder-specific routes here
// router.get('/', authenticate, folderController.getUserFolders);
// router.post('/', authenticate, folderController.createFolder);
// router.delete('/:id', authenticate, folderController.deleteFolder);

export default router;
