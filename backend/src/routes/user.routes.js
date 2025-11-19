import express from 'express';
import userController from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * User Routes
 * All routes require authentication
 */

// GET /api/users - Get all users
router.get('/', authenticate, userController.getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', authenticate, userController.getUserById);

// PATCH /api/users/:id - Update user
router.patch('/:id', authenticate, userController.updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', authenticate, userController.deleteUser);

export default router;
