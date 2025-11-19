import express from 'express';
import authController from '../controllers/auth.controller.js';
import { signupValidation, signinValidation } from '../middlewares/validator.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * Auth Routes
 */

// POST /api/auth/signup - Sign up new user
router.post('/signup', signupValidation, authController.signup);

// POST /api/auth/signin - Sign in user
router.post('/signin', signinValidation, authController.signin);

// GET /api/auth/me - Get current user
router.get('/me', authenticate, authController.me);

export default router;
