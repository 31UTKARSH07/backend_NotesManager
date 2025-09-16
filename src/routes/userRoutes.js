import express from "express";
import getCurrentUser from "../controller/userController.js";
import isAuth from "../middleware/isAuth.js";

const userRouter = express.Router();

userRouter.get('/current',isAuth,getCurrentUser);

export default userRouter;