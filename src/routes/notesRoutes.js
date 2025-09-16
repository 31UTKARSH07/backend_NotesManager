import express from "express"
import {
    createNotes,
    getAllNotes,
    updateNotes,
    deleteNotes,
    getNoteById,
    searchNotes,
    filterByTag
} from "../controller/notesController.js"
const router = express.Router();



router.get("/", getAllNotes);
router.get("/search", searchNotes);
router.get("/tag/:tag", filterByTag);
router.post("/", createNotes);

router.get("/:id", getNoteById);
router.put("/:id", updateNotes);
router.delete("/:id", deleteNotes);

export default router

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