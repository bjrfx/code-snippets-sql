import { asyncHandler } from '../middlewares/errorHandler.js';
import noteService from '../services/note.service.js';
import { successResponse } from '../utils/helpers.js';

/**
 * Note Controller
 */
class NoteController {
  /**
   * Get all notes for current user
   * GET /api/notes
   */
  getUserNotes = asyncHandler(async (req, res) => {
    const notes = await noteService.getNotesByUser(req.userId);
    res.json(successResponse(notes));
  });

  /**
   * Get note by ID
   * GET /api/notes/:id
   */
  getNoteById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const note = await noteService.getNoteById(id);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }
    
    res.json(successResponse(note));
  });

  /**
   * Get notes by folder
   * GET /api/folders/:folderId/notes
   */
  getNotesByFolder = asyncHandler(async (req, res) => {
    const { folderId } = req.params;
    const notes = await noteService.getNotesByFolder(folderId);
    res.json(successResponse(notes));
  });

  /**
   * Get notes by project
   * GET /api/projects/:projectId/notes
   */
  getNotesByProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const notes = await noteService.getNotesByProject(projectId);
    res.json(successResponse(notes));
  });

  /**
   * Create new note
   * POST /api/notes
   */
  createNote = asyncHandler(async (req, res) => {
    const noteData = {
      ...req.body,
      userId: req.userId
    };
    
    const note = await noteService.createNote(noteData);
    res.status(201).json(successResponse(note, 'Note created successfully'));
  });

  /**
   * Update note
   * PATCH /api/notes/:id
   */
  updateNote = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const note = await noteService.updateNote(id, req.body);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }
    
    res.json(successResponse(note, 'Note updated successfully'));
  });

  /**
   * Delete note
   * DELETE /api/notes/:id
   */
  deleteNote = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await noteService.deleteNote(id);
    res.status(204).send();
  });
}

export default new NoteController();
