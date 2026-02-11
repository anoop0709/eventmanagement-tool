import express from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
  getDraftEvents,
  getDashboardStats,
  downloadEventPDF,
} from '../controllers/event.controller.js';
import { protect, admin } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { eventValidation } from '../middleware/validation.js';

const router = express.Router();

// Apply rate limiting to all event routes
router.use(apiLimiter);

router.route('/').get(protect, getEvents).post(protect, eventValidation, createEvent);

// Special routes (must be before /:id)
router.get('/calendar/upcoming', protect, getUpcomingEvents);
router.get('/drafts', protect, getDraftEvents);
router.get('/dashboard/stats', protect, admin, getDashboardStats);

// Download PDF route
router.get('/:id/download-pdf', protect, downloadEventPDF);

router
  .route('/:id')
  .get(protect, getEventById)
  .put(protect, updateEvent)
  .delete(protect, admin, deleteEvent);

export default router;
