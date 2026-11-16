
import {
  registerUser,
  loginUser,
} from './auth.service.js';

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Registration error:', error);

    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred.',
    });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Login error:', error);

    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred.',
    });
  }
};
