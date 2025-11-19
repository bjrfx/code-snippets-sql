import { asyncHandler } from '../middlewares/errorHandler.js';
import snippetService from '../services/snippet.service.js';
import noteService from '../services/note.service.js';
import { successResponse } from '../utils/helpers.js';

/**
 * Search Controller
 */
class SearchController {
  /**
   * Search across all content types
   * GET /api/search?q=query
   */
  search = asyncHandler(async (req, res) => {
    const { q } = req.query;
    
    // Search in parallel
    const [snippets, notes] = await Promise.all([
      snippetService.searchSnippets(req.userId, q),
      noteService.searchNotes(req.userId, q)
    ]);
    
    res.json(successResponse({
      snippets,
      notes,
      checklists: [], // Add checklist search if needed
      smartNotes: []  // Add smart note search if needed
    }));
  });
}

export default new SearchController();
