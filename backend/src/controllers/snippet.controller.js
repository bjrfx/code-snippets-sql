import { asyncHandler } from '../middlewares/errorHandler.js';
import snippetService from '../services/snippet.service.js';
import { successResponse } from '../utils/helpers.js';

/**
 * Snippet Controller
 */
class SnippetController {
  /**
   * Get all snippets for current user
   * GET /api/snippets
   */
  getUserSnippets = asyncHandler(async (req, res) => {
    const snippets = await snippetService.getSnippetsByUser(req.userId);
    res.json(successResponse(snippets));
  });

  /**
   * Get snippet by ID
   * GET /api/snippets/:id
   */
  getSnippetById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const snippet = await snippetService.getSnippetById(id);
    
    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: 'Snippet not found'
      });
    }
    
    res.json(successResponse(snippet));
  });

  /**
   * Get snippets by folder
   * GET /api/folders/:folderId/snippets
   */
  getSnippetsByFolder = asyncHandler(async (req, res) => {
    const { folderId } = req.params;
    const snippets = await snippetService.getSnippetsByFolder(folderId);
    res.json(successResponse(snippets));
  });

  /**
   * Get snippets by project
   * GET /api/projects/:projectId/snippets
   */
  getSnippetsByProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const snippets = await snippetService.getSnippetsByProject(projectId);
    res.json(successResponse(snippets));
  });

  /**
   * Create new snippet
   * POST /api/snippets
   */
  createSnippet = asyncHandler(async (req, res) => {
    const snippetData = {
      ...req.body,
      userId: req.userId
    };
    
    const snippet = await snippetService.createSnippet(snippetData);
    res.status(201).json(successResponse(snippet, 'Snippet created successfully'));
  });

  /**
   * Update snippet
   * PATCH /api/snippets/:id
   */
  updateSnippet = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const snippet = await snippetService.updateSnippet(id, req.body);
    
    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: 'Snippet not found'
      });
    }
    
    res.json(successResponse(snippet, 'Snippet updated successfully'));
  });

  /**
   * Delete snippet
   * DELETE /api/snippets/:id
   */
  deleteSnippet = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await snippetService.deleteSnippet(id);
    res.status(204).send();
  });
}

export default new SnippetController();
