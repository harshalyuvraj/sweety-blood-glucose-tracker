
import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';

import {
  createReadingSchema,
  updateReadingSchema,
} from './readings.validation.js';

import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from './readings.controller.js';

const router = Router();

// All reading endpoints require authentication.
router.use(authenticate);

// POST /api/readings
router.post('/', validate(createReadingSchema), create);

// GET /api/readings
router.get('/', getAll);

// GET /api/readings/:id
router.get('/:id', getOne);

// PUT /api/readings/:id
router.put('/:id', validate(updateReadingSchema), update);

// DELETE /api/readings/:id
router.delete('/:id', remove);

export default router;
