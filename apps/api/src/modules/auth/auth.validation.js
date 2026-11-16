
import { z } from 'zod';

// bcrypt supports a maximum password length of 72 bytes.
// Buffer.byteLength checks the actual UTF-8 byte length,
// rather than just counting characters.
const passwordSchema = z
  .string()
  .min(8, 'Password must contain at least 8 characters.')
  .refine(
    (value) => Buffer.byteLength(value, 'utf8') <= 72,
    'Password cannot exceed 72 bytes.'
  );

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must contain at least 2 characters.')
    .max(100, 'Name cannot exceed 100 characters.'),

  email: z
    .string()
    .trim()
    .email('Please enter a valid email address.')
    .max(255, 'Email cannot exceed 255 characters.')
    .transform((value) => value.toLowerCase()),

  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address.')
    .max(255, 'Email cannot exceed 255 characters.')
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(1, 'Password is required.')
    .refine(
      (value) => Buffer.byteLength(value, 'utf8') <= 72,
      'Password cannot exceed 72 bytes.'
    ),
});
