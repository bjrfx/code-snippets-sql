import { asyncHandler } from '../middlewares/errorHandler.js';
import projectService from '../services/project.service.js';
import { successResponse } from '../utils/helpers.js';

/**
 * Project Controller
 */
class ProjectController {
  /**
   * Get all projects for current user
   * GET /api/projects
   */
  getUserProjects = asyncHandler(async (req, res) => {
    const projects = await projectService.getProjectsByUser(req.userId);
    res.json(successResponse(projects));
  });

  /**
   * Get project by ID
   * GET /api/projects/:id
   */
  getProjectById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const project = await projectService.getProjectById(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json(successResponse(project));
  });

  /**
   * Get project statistics
   * GET /api/projects/:id/stats
   */
  getProjectStats = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const stats = await projectService.getProjectStats(id, req.userId);
    res.json(successResponse(stats));
  });

  /**
   * Create new project
   * POST /api/projects
   */
  createProject = asyncHandler(async (req, res) => {
    const projectData = {
      ...req.body,
      userId: req.userId
    };
    
    const project = await projectService.createProject(projectData);
    res.status(201).json(successResponse(project, 'Project created successfully'));
  });

  /**
   * Update project
   * PATCH /api/projects/:id
   */
  updateProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const project = await projectService.updateProject(id, req.body);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json(successResponse(project, 'Project updated successfully'));
  });

  /**
   * Delete project
   * DELETE /api/projects/:id
   */
  deleteProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await projectService.deleteProject(id);
    res.status(204).send();
  });
}

export default new ProjectController();
