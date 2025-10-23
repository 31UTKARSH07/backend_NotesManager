import jwt from "jsonwebtoken";
import User from "../models/User.js";

const isAuth = async (req, res, next) => {
  const token = req.cookies.token;
  console.log(token)
  if (!token) {
    return res.status(401).json({ message: "Not Authorised" });
  }
  try {
    
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Not Authorised" });
      }
      console.log(decoded);
      let id = decoded?.id

      const user = await User.findById(id);
      req.user = user;
      console.log("Decoded user from token:", req.user);
      next();
    });
  } catch (error) {
    return res.status(401).json({ message: "Not Authorised" });
  }
};
export default isAuth;
