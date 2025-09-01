import jwt from 'jsonwebtoken';


export const generateAccessToken = (userId) => {
    return jwt.sign(
        {
            userId,
            type: 'access'
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
        }
    );
};

export const generateRefreshToken = (userId) => {
    return jwt.sign(
        {
            userId,
            type: 'refresh'
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
        }
    );
};

export const verifyAccessToken = (token) => {
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
        };
    }
};

export const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        if (decoded.type !== 'refresh') {
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
        };
    }
};

export const generateTokenPair = (userId) => {
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    return {
        accessToken,
        refreshToken
    };
};

