
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { query } from '../../db/query.js';
import { logActivity } from '../activity/activity.service.js';

// Number of bcrypt hashing rounds.
const SALT_ROUNDS = 12;

// Generate a JWT token for an authenticated user.
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured.');
  }

  return jwt.sign(
    { sub: userId },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

// Register a new user.
export const registerUser = async ({ name, email, password }) => {
  // Check whether the email is already registered.
  const existingUser = await query(
    'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );

  if (existingUser.rows.length > 0) {
    const error = new Error('An account with this email already exists.');
    error.statusCode = 409;
    throw error;
  }

  // Hash the password before storing it.
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const result = await query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at, is_admin`,
      [name, email, passwordHash]
    );

    const user = result.rows[0];
    const token = generateToken(user.id);

    // Record successful registration.
    await logActivity(user.id, 'user_registered');

    return {
      user,
      token,
    };
  } catch (error) {
    // Handle a duplicate email in case two registrations
    // happen simultaneously.
    if (error.code === '23505') {
      const conflictError = new Error(
        'An account with this email already exists.'
      );
      conflictError.statusCode = 409;
      throw conflictError;
    }

    throw error;
  }
};

// Authenticate an existing user.
export const loginUser = async ({ email, password }) => {
  const result = await query(
    `SELECT id, name, email, password_hash, created_at, is_admin
     FROM users
     WHERE LOWER(email) = LOWER($1)`,
    [email]
  );

  const user = result.rows[0];

  // Use the same error message for an unknown email
  // and an incorrect password.
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  // Compare the submitted password with the stored hash.
  const passwordMatches = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatches) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user.id);

  // Never return the password hash to the client.
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
    is_admin: user.is_admin,
  };

  // Record successful login.
  await logActivity(user.id, 'user_logged_in');

  return {
    user: safeUser,
    token,
  };
};
