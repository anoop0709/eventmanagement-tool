import express from 'express';
import { getDecorationCatalog, uploadDecorationImage } from '../controllers/catalog.controller.js';
import { protect, admin } from '../middleware/auth.js';
import { uploadDecoration } from '../middleware/upload.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// GET /api/catalog/decorations
router.get('/decorations', getDecorationCatalog);

// POST /api/catalog/decorations/upload (Admin only)
router.post('/decorations/upload', admin, uploadDecoration, uploadDecorationImage);

export default router;
