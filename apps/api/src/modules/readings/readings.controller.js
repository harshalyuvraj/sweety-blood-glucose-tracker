
import {
  createReading,
  getReadings,
  getReadingById,
  updateReading,
  deleteReading,
} from './readings.service.js';

// POST /api/readings
export const create = async (req, res) => {
  try {
    const reading = await createReading(req.user.id, req.body);

    return res.status(201).json({
      success: true,
      message: 'Reading created successfully.',
      data: reading,
    });
  } catch (error) {
    return handleError(res, error, 'Failed to create reading.');
  }
};

// GET /api/readings
export const getAll = async (req, res) => {
  try {
    const readings = await getReadings(req.user.id);

    return res.status(200).json({
      success: true,
      data: readings,
    });
  } catch (error) {
    return handleError(res, error, 'Failed to retrieve readings.');
  }
};

// GET /api/readings/:id
export const getOne = async (req, res) => {
  try {
    const reading = await getReadingById(req.user.id, req.params.id);

    return res.status(200).json({
      success: true,
      data: reading,
    });
  } catch (error) {
    return handleError(res, error, 'Failed to retrieve reading.');
  }
};

// PUT /api/readings/:id
export const update = async (req, res) => {
  try {
    const reading = await updateReading(
      req.user.id,
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: 'Reading updated successfully.',
      data: reading,
    });
  } catch (error) {
    return handleError(res, error, 'Failed to update reading.');
  }
};

// DELETE /api/readings/:id
export const remove = async (req, res) => {
  try {
    await deleteReading(req.user.id, req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Reading deleted successfully.',
    });
  } catch (error) {
    return handleError(res, error, 'Failed to delete reading.');
  }
};

// Centralized error response handling.
const handleError = (res, error, fallbackMessage) => {
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  console.error(fallbackMessage, error);

  return res.status(500).json({
    success: false,
    message: 'An unexpected error occurred.',
  });
};
