import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import notesRoutes from "./routes/notesRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { rateLimit } from "express-rate-limit";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import isAuth from "./middleware/isAuth.js";
import https from "https";
import fs from "fs"; 


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();
// middleware
// if(process.env.NODE_ENV !== "production"){
// app.use(cors(
//    { origin:"http://localhost:5173"}
// ))
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      const allowedProductionOrigin = "https://frontend-notesmanager.onrender.com";

      if (
        !origin ||
        origin.startsWith("http://localhost") ||
        origin.startsWith("http://127.0.0.1") ||
        origin === allowedProductionOrigin
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // This is CRUCIAL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200,
  })
);
// app.options('*', cors());

app.use(express.json());
app.use(cookieParser());

const options = {
  key: fs.readFileSync('./localhost+2-key.pem'),
  cert: fs.readFileSync('./localhost+2.pem'),
};
// Add this test route
app.get("/test-cookie", (req, res) => {
  console.log("=== COOKIE TEST ===");
  console.log("Received cookies:", req.cookies);

  res.cookie("testCookie", "testValue123", {
    httpOnly: false, // Make it visible in browser
    secure: false,
    sameSite: "lax",
    maxAge: 60000,
    path: "/",
  });

  res.json({ message: "Test cookie set", receivedCookies: req.cookies });
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increase limit significantly for development
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting entirely in development
  skip: (req) => {
    return (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV !== "production"
    );
  },
});

connectDB().then(() => {
  https.createServer(options, app).listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
  });
});

app.use("/api/auth", authLimiter);

app.use("/api/auth", authRoutes); // it should be public 
app.use("/api/user", userRouter); // userdetail endpoints should be private 
app.use("/api/notes", isAuth,  notesRoutes); // notes update/crete/delete should be private 