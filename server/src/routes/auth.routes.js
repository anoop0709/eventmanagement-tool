import express from 'express';
import { register, login, logout, refreshToken, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter.js';
import { loginValidation, registerValidation } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', registerLimiter, registerValidation, register);
router.post('/login', loginLimiter, loginValidation, login);
router.post('/logout', protect, logout);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);

export default router;
