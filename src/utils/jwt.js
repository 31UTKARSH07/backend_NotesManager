const { valid } = require('joi')
const jwt = require('jsonwebtoken')

const generateAccessToken = (userId) => {
    return jwt.sign(
        {
            userId,
            type: 'access'
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_SECRET || '15m'
        }
    )
}
const generateRefreshToken = (userId) => {
    return jwt.sign(
        {
            userId,
            type: 'refresh'
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_SECRET || '7d'
        }
    )
}
const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        if (decoded.type !== 'access') {
            throw new Error('Invalid token type');
        }
        return {
            valid: true,
            decoded
        };
    } catch (error) {
        return {
            valid: false,
            error: error.message
        }
    }
}
const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.varify(token, process.env.JWT_REFRESH_SECRET);
        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }
        return {
            valid: true,
            decoded
        }
    } catch (error) {
        return {
            valid: false,
            error: error.message
        }
    }
}
const generateTokenPair = (userId) => {
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    return {
        accessToken,
        refreshToken
    }
}
module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    generateTokenPair
}