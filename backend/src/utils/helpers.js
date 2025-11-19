import { nanoid } from 'nanoid';

/**
 * Generate unique ID
 */
export const generateId = () => nanoid();

/**
 * Get current timestamp
 */
export const timestamp = () => Date.now();

/**
 * Parse JSON safely
 */
export const parseJSON = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return fallback;
  }
};

/**
 * Ensure value is an array
 */
export const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

/**
 * Remove password from user object
 */
export const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Create success response
 */
export const successResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data
});

/**
 * Create error response
 */
export const errorResponse = (message, errors = null) => ({
  success: false,
  message,
  ...(errors && { errors })
});

/**
 * Paginate array
 */
export const paginate = (array, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  return {
    data: array.slice(startIndex, endIndex),
    page,
    limit,
    total: array.length,
    totalPages: Math.ceil(array.length / limit)
  };
};

export default {
  generateId,
  timestamp,
  parseJSON,
  ensureArray,
  sanitizeUser,
  successResponse,
  errorResponse,
  paginate
};
