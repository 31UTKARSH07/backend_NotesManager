import express from "express";
import {
  createNotes,
  getAllNotes,
  updateNotes,
  deleteNotes,
  getNoteById,
  searchNotes,
  filterByTag,
  toggleArchive,
  getArchivedNotes,
  getTrashedNotes,
  moveToTrash,
  restoreNote,
  deletePermanently,
  shareNote,
  getSharedNote,
} from "../controller/notesController.js";
import isAuth from "../middleware/isAuth.js";
const router = express.Router();

router.get("/public/:sharedId", getSharedNote);
router.get("/",isAuth, getAllNotes);
router.get("/search",isAuth, searchNotes);
router.get("/tag/:tag",isAuth, filterByTag);
router.post("/",isAuth, createNotes);
router.put("/:id/archive",isAuth, toggleArchive);
router.get("/archived",isAuth, getArchivedNotes);
router.get("/trashed",isAuth,getTrashedNotes);
router.put("/:id/trash",isAuth,moveToTrash);
router.put("/:id/restore",isAuth,restoreNote);
router.post("/:id/share",isAuth,shareNote);
router.delete("/:id/permanent",isAuth,deletePermanently);

router.get("/:id", getNoteById);
router.put("/:id", updateNotes);
router.delete("/:id", deleteNotes);

export default router;

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
