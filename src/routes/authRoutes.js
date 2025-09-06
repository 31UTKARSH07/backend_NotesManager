import express from 'express';
import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  forgotPassword,
  resetPassword
} from '../controller/authController.js';
import{authenticateToken,getUserProfile} from '../middleware/auth.js'

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser)
router.post('/refresh', refreshToken)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/profile',authenticateToken,getUserProfile)
router.post('/logout',authenticateToken, logoutUser)

export default router