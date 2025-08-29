const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const { func } = require('joi');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        requred: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email'
        ]
    },
    password: {
        type: String,
        requred: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
    },
    resetPasswordToken: {
        type: String,
        default: undefined,
    },
    resetPasswordExpire: {
        type: Date,
        default: undefined
    },

    refreshTokens: [{
        token: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    isActive: {
        type: String,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

//Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enterPassword) {
    return await bcrypt.compare(enterPassword, this.password);
};
//Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = require('crypto').randomBytes(20).toString('hex')
    this.resetPasswordToken = require('crypto')
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
};
//Add refresh token
userSchema.methods.addRefreshToken = function (token) {
    this.refreshTokens.push({
        token,
        createdAt: new Date()
    });
};
//Remove refresh token
userSchema.methods.removeRefreshToken = function (token) {
    this.refreshTokens = this.refreshTokens.filter(
        tokenObj => tokenObj.token !== token
    );
};
//Clean expired refresh tokens
userSchema.methods.cleanExpiredTokens = function () {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.refreshTokens = this.refreshTokens.filter(
        tokenObj => tokenObj.createdAt > sevenDaysAgo
    );
};
module.exports = mongoose.model('User', userSchema);