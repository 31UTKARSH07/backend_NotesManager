import express from "express";
import {
  getCurrentUser,
  updateProfilePicture,
} from "../controller/userController.js";
import isAuth from "../middleware/isAuth.js";
import upload from "../middleware/upload.js";

const userRouter = express.Router();

userRouter.get("/profile", isAuth, getCurrentUser);

// 2. Fixed this route to use "userRouter" instead of the notes router
userRouter.put(
  "/profile/picture",
  isAuth,
  upload.single("avatar"),
  updateProfilePicture
);

export default userRouter;