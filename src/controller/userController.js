import User from "../models/User.js";
import Note from "../models/Note.js";
import cloudinary from "cloudinary";

const getCurrentUser = async (req, res) => {
  const userId = req.user.id || req.user._id;
  if (userId === undefined) {
    return res.status(401).json({ message: "Not Authorized" });
  }
  try {
    const verifiedUser = await User.findById(userId).select("-password");
    if (!verifiedUser) {
        return res.status(404).json({ message: "User not found" });
    } 
    const noteCount = await Note.countDocuments({ userId: userId });
    res.json({ 
        user: verifiedUser,
        noteCount: noteCount
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error with me" });
  }
};

const updateProfilePicture = async (req, res) => {
  const userId = req.user.id || req.user._id;
  if (!userId) {
    return res.status(401).json({ message: "Not Authorized" });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: "thinkboard_avatars",
      width: 150,
      crop: "fill",
    });

    const user = await User.findById(userId);
    user.avatarUrl = result.secure_url;
    await user.save();

    res.status(200).json({
      message: "Profile picture updated successfully.",
      avatarUrl: user.avatarUrl,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ message: "Server error while updating profile picture." });
  }
};
export { getCurrentUser, updateProfilePicture };
