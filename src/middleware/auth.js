import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.header["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Access denied. No token provided.",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        error: "Invalid token. User not found.",
      });
    }
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid Token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired.",
      });
    }
    console.error("Auth error:", error);
    res.status(500).json({
      error: "Server error during authentication.",
    });
  }
};

export const authorizeNoteAccess = async (req, res, next) => {
  try {
    const noteId = req.params.id;
    const userId = req.user._id;

    const { default: Note } = await import("../models/Note.js");
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({
        error: "Note not found.",
      });
    }
    if (note.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        error: "Access denied. You can only access your own notes.",
      });
    }
    req.note = note;
    next();
  } catch (error) {
    console.error("Authorization middleware error:", error);
    res.status(500).json({
      error: "Server error during authorization.",
    });
  }
};
export const getUserProfile = async (req, res, next) => {
  try {
    const user = req.user;
    
    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};