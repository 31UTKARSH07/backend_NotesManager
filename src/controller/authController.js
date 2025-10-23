import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../config/token.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;
    if (!name || !email || !password || !username) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //console.log("Salt:", salt);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      username,
    });
    const token = await generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      secure: true
    });
    //console.log("Token:", token);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// In src/controller/authController.js

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    const token = await generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 60 * 60 * 1000,
    });
    console.log(res.cookie.token)
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      const { valid, decoded } = verifyRefreshToken(refreshToken);

      if (valid && decoded) {
        const user = await User.findById(decoded.userId);
        if (user) {
          user.removeRefreshToken(refreshToken);
          await user.save();
        }
      }
    }
    // Clear cookie with same options used when setting it
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });
    res.status(200).json({
      success: true,
      message: "Logout Successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during logout",
    });
  }
};
