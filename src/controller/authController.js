
import crypto from 'crypto';
import User from '../models/User.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.js';
import {
  registerValidation,
  LoginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  formatValidationErrors
} from '../utils/validation.js';
import { sendPasswordResetEmail,  } from '../utils/email.js';


export const registerUser = async (req, res) => {
    try {
        console.log('Registration attempt:', req.body.email);

        const { error } = registerValidation(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: formatValidationErrors(error)
            });
        }

        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        const user = new User({
            name,
            email,
            password
        });
        await user.save() //.save is used to create a new record in the database. or update if the data is already present 
        const { accessToken, refreshToken } = generateTokenPair(user._id);
        user.addRefreshToken(refreshToken)
        await user.save();
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt
                },
                accessToken
            }
        })
    } catch (error) {
        console.log('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
};
export const loginUser = async (req, res) => {
    try {
        console.log('Login attempt:', req.body.email);

        const { error } = LoginValidation(req.body)
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: formatValidationErrors(error)
            });
        }
        const { email, password, rememberMe = false } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        const isPasswordCorrect = await user.matchPassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        const { accessToken, refreshToken } = generateTokenPair(user._id);

        user.cleanExpiredTokens();
        user.addRefreshToken(refreshToken);
        user.lastLogin = new Date();
        await user.save();

        const cookieMaxAge = rememberMe
            ? 30 * 24 * 60 * 60 * 1000
            : 7 * 24 * 60 * 60 * 1000;

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: cookieMaxAge
        });

        res.status(200).json({
            success: true,
            message: 'Login Successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    lastLogin: user.lastLogin
                },
                accessToken
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        })
    }
};
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not found'
            });
        }
        const { valid, decoded, error } = verifyRefreshToken(refreshToken);

        if (!valid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token',
                error
            });
        }
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            })
        }
        const tokenExists = user.refreshTokens.some(
            tokenObj => tokenObj.token === refreshToken // this is the test function that .some method runs on refreshToken array in DB
        );
        if (!tokenExists) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not found in database'
            });
        }
        const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user._id);
        user.removeRefreshToken(refreshToken);
        user.addRefreshToken(newRefreshToken);
        await user.save();
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken
            }
        })
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during token refresh'
        })
    }
}
export const logoutUser = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (refreshToken) {
            const { valid, decoded } = verifyRefreshToken(refreshToken);

            if (valid) {
                const user = await User.findById(decoded.userId);
                if (user) {
                    user.removeRefreshToken(refreshToken);
                    await user.save();
                }
            }
        }
        res.clearCookie('refreshToken');

        res.status(200).json({
            success: true,
            message: 'Logout Successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during logout'
        })
    }
}
export const forgotPassword = async (req, res) => {
    try {
        const { error } = forgotPasswordValidation(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: formatValidationErrors(error)
            });
        }
        const { email } = req.body;

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If an account with that email exists, we have sent a password reset email'
            })
        }
        const resetToken = user.getResetPasswordToken();
        await user.save();
        try {
            const emailResult = await sendPasswordResetEmail(user.email, resetToken);

            if (emailResult.success) {
                console.log('Password reset email sent successfully');
            } else {
                console.log('Failed to send password reset email:', emailResult.error);
            }
        } catch (emailError) {
            console.log('Email sending error:', emailError);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();// so this save function save data or we say restore data in database

            return res.status(500).json({
                success: false,
                message: 'Error sending password reset email'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Password reset email sent successfully'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}
export const resetPassword = async (req, res) => {
    try {
        const { error } = resetPasswordValidation(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: formatValidationErrors(error)
            })
        }
        const { token, password } = req.body;

        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.refreshTokens = [];
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}
