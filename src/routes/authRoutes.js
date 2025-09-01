import express from 'express';
import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  forgotPassword,
  resetPassword
} from '../controller/authController.js';


const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser)
router.post('/refresh', refreshToken)
router.post('/logout', logoutUser)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

export default router