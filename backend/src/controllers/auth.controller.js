import { asyncHandler } from '../middlewares/errorHandler.js';
import authService from '../services/auth.service.js';
import { successResponse } from '../utils/helpers.js';

/**
 * Auth Controller
 */
class AuthController {
  /**
   * Sign up new user
   * POST /api/auth/signup
   */
  signup = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    const result = await authService.signup(email, password);
    
    res.status(201).json(successResponse(result, 'User created successfully'));
  });

  /**
   * Sign in user
   * POST /api/auth/signin
   */
  signin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    const result = await authService.signin(email, password);
    
    res.json(successResponse(result, 'Login successful'));
  });

  /**
   * Get current user
   * GET /api/auth/me
   */
  me = asyncHandler(async (req, res) => {
    const user = await authService.getUserById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json(successResponse(user));
  });
}

export default new AuthController();
