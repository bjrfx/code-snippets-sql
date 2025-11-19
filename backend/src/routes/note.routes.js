import express from 'express';
import noteController from '../controllers/note.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { createNoteValidation } from '../middlewares/validator.js';

const router = express.Router();

/**
 * Note Routes
 * All routes require authentication
 */

// GET /api/notes - Get all notes for current user
router.get('/', authenticate, noteController.getUserNotes);

// GET /api/notes/:id - Get note by ID
router.get('/:id', authenticate, noteController.getNoteById);

// POST /api/notes - Create new note
router.post('/', authenticate, createNoteValidation, noteController.createNote);

// PATCH /api/notes/:id - Update note
router.patch('/:id', authenticate, noteController.updateNote);

// DELETE /api/notes/:id - Delete note
router.delete('/:id', authenticate, noteController.deleteNote);

export default router;
