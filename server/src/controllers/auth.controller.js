import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import logger from '../config/logger.js';
import { logSecurityEvent } from '../middleware/logging.js';

// Generate Access Token (short-lived)
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
};

// Generate Refresh Token (long-lived)
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

// Set token cookie
const setTokenCookie = (res, token, name = 'token') => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: parseInt(process.env.COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie(name, token, cookieOptions);
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      logSecurityEvent('REGISTRATION_FAILED', {
        email,
        reason: 'User already exists',
        ip: req.ip,
      });
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token to database
      user.refreshToken = refreshToken;
      await user.save();
logger.info('User registered', { userId: user._id, email: user.email });

      
      // Set cookies
      setTokenCookie(res, accessToken, 'token');
      setTokenCookie(res, refreshToken, 'refreshToken');

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user (include password and loginAttempts)
    const user = await User.findOne({ email }).select('+password +lockUntil +loginAttempts');

    if (!user) {
      logSecurityEvent('LOGIN_FAILED', {
        email,
        reason: 'User not found',
        ip: req.ip,
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked) {
      logSecurityEvent('LOGIN_FAILED', {
        email,
        reason: 'Account locked',
        ip: req.ip,
        lockUntil: user.lockUntil,
      });
      return res.status(423).json({
        message: 'Account is locked due to too many failed login attempts. Please try again later.',
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      await user.incLoginAttempts();
      // Refetch user to get updated loginAttempts count after increment
      const updatedUser = await User.findById(user._id).select('+loginAttempts +lockUntil');
      logSecurityEvent('LOGIN_FAILED', {
        email,
        reason: 'Invalid password',
        attempts: updatedUser.loginAttempts,
        isLocked: updatedUser.isLocked,
        ip: req.ip,
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0 || user.lockUntil) {
      await user.resetLoginAttempts();
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookies
    setTokenCookie(res, accessToken, 'token');
    setTokenCookie(res, refreshToken, 'refreshToken');

    logger.info('User logged in', { userId: user._id, email: user.email });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // Clear refresh token from database
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

    // Clear cookies
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if user exists and token matches
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user._id);

    // Set new access token cookie
    setTokenCookie(res, accessToken, 'token');

    res.json({
      token: accessToken,
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
