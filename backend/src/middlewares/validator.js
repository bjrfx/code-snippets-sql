import { body, param, query, validationResult } from 'express-validator';

/**
 * Validate request and return errors if any
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  
  next();
};

// Auth validators
export const signupValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validate
];

export const signinValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

// Snippet validators
export const createSnippetValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('content')
    .notEmpty()
    .withMessage('Content is required'),
  body('language')
    .notEmpty()
    .withMessage('Language is required'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  validate
];

export const updateSnippetValidation = [
  param('id')
    .notEmpty()
    .withMessage('Snippet ID is required'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty'),
  body('content')
    .optional()
    .notEmpty()
    .withMessage('Content cannot be empty'),
  validate
];

// Note validators
export const createNoteValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('content')
    .notEmpty()
    .withMessage('Content is required'),
  validate
];

// Project validators
export const createProjectValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required'),
  validate
];

// Search validator
export const searchValidation = [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 1 })
    .withMessage('Search query must be at least 1 character'),
  validate
];

export default {
  validate,
  signupValidation,
  signinValidation,
  createSnippetValidation,
  updateSnippetValidation,
  createNoteValidation,
  createProjectValidation,
  searchValidation
};
