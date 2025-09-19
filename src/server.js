import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import path from "path"
import cookieParser from "cookie-parser";
import notesRoutes from "./routes/notesRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import { rateLimit } from "express-rate-limit";
import { connectDB } from "./config/db.js"
import userRouter from "./routes/userRoutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001
const __dirname = path.resolve();
// middleware
// if(process.env.NODE_ENV !== "production"){
// app.use(cors(
//    { origin:"http://localhost:5173"}
// ))
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://frontend-notesmanager.onrender.com'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // This is CRUCIAL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));
// app.options('*', cors());


app.use(express.json());
app.use(cookieParser());
// Add this test route
app.get('/test-cookie', (req, res) => {
    console.log('=== COOKIE TEST ===');
    console.log('Received cookies:', req.cookies);
    
    res.cookie('testCookie', 'testValue123', {
        httpOnly: false, // Make it visible in browser
        secure: false,
        sameSite: 'lax',
        maxAge: 60000,
        path: '/'
    });
    
    res.json({ message: 'Test cookie set', receivedCookies: req.cookies });
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increase limit significantly for development
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting entirely in development
  skip: (req) => {
    return process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production';
  }
});

app.use('/api/auth', authLimiter);

app.use("/api/auth",authRoutes)
app.use("/api/user",userRouter)
app.use("/api/notes", notesRoutes)
// if(process.env.NODE_ENV === "production"){
//    app.use(express.static(path.join(__dirname,"../frontend/dist")))
// app.get("*",(req,res)=>{
//    res.sendFile(path.join(__dirname,"../frontend","dist","index.html"))
// })
// }
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started on PORT:", PORT)
  })
})
//app.get("/api/notes", (req,res)=>{
//res.status(200).send("you got 10 notes")
//});
//
//app.post("/api/notes",(req,res)=>{
//res.status(201).json({message:"Note created successfully"})
//})
//
//app.put("/api/notes/:id",(req,res)=>{
//res.status(200).json({message:"Note updated successfully"})
//}) // for update we use put method
//
//app.delete("/api/notes/:id",(req,res)=>{
//res.status(200).json({message:"Note deleted successfully"})
//})


//mongodb+srv://3107utkarshpathak:kWZF6Ky1DpR41Skh@cluster0.wqhtiub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0