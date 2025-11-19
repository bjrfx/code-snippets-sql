import { asyncHandler } from '../middlewares/errorHandler.js';
import userService from '../services/user.service.js';
import { successResponse } from '../utils/helpers.js';

/**
 * User Controller
 */
class UserController {
  /**
   * Get all users (Admin only)
   * GET /api/users
   */
  getAllUsers = asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers();
    res.json(successResponse(users));
  });

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json(successResponse(user));
  });

  /**
   * Update user
   * PATCH /api/users/:id
   */
  updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Check authorization
    if (req.userId !== id) {
      const isAdmin = await userService.isAdmin(req.userId);
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this user'
        });
      }
    }
    
    const user = await userService.updateUser(id, req.body);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json(successResponse(user, 'User updated successfully'));
  });

  /**
   * Delete user
   * DELETE /api/users/:id
   */
  deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Check authorization
    if (req.userId !== id) {
      const isAdmin = await userService.isAdmin(req.userId);
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this user'
        });
      }
    }
    
    await userService.deleteUser(id);
    
    res.status(204).send();
  });
}

export default new UserController();
