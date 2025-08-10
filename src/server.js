import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import notesRoutes from "./routes/notesRoutes.js"
import {connectDB} from "./config/db.js"
import rateLimiter from "./middleware/rateLimiter.js"
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001

// middleware
app.use(cors(
   { origin:"http://localhost:5173"}
))
app.use(express.json());
app.use(rateLimiter);
//our simple custom middleware
//app.use((req,res,next)=>{
//console.log(`Req method is ${req.method} & Req URL is ${req.url}`);
//next();
//})

app.use("/api/notes",notesRoutes)

connectDB().then(()=>{
app.listen(PORT, () => {
console.log("Server started on PORT:",PORT)
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