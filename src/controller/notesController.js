import Note from "../models/Note.js"

export async function getAllNotes(req, res) {
    try {
        const notes = await Note.find().sort({ createdAt: -1 }); // sort by -1 gives order in descending order i.e. lastcomefirstserve;
        console.log(req.params)
        res.status(200).json(notes);
    } catch (error) {
        console.log("Error in getAllNotes controller ", error);
        res.status(500).json({ message: "Internal server error" })
    }
}
export async function createNotes(req, res) {
    try {
        const { title, content } = req.body;
        const note = new Note({ title, content })
        const savedNote = await note.save()
        res.status(201).json(savedNote)
    } catch (error) {
        console.error("Error in getAllNotes controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
export async function updateNotes(req, res) {
    try {
        const { title, content, tags } = req.body
        const updatedNote = await Note.findByIdAndUpdate(req.params.id, { title, content, tags }, { new: true })
        if (!updatedNote) return res.status(404).json({ message: "Note not found" })
        res.status(200).json(updatedNote)

    } catch (error) {
        console.error("Error in updateNotes controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
export async function deleteNotes(req, res) {
    try {
        //const {title,content} = req.body
        const deleteNote = await Note.findByIdAndDelete(req.params.id)
        if (!deleteNote) return res.status(404).json({ message: "Note not found to delete" })
        res.status(200).json({ message: "Note deleted successfully" })
    } catch (error) {
        console.error("Error in delete controller", error);
        res.status(500).json({ message: "Internal server error" })
    }
}
export async function getNoteById(req, res) {
    try {
        const getNoteById = await Note.findById(req.params.id);
        if (!getNoteById) return res.status(400).json({ message: "Note not found!!" })
        console.log(req.params)
        res.json(getNoteById)
    } catch (error) {
        console.error("Error in getNoteById controller", error);
        res.status(500).json({ message: "Internal server error" })
    }
}
export async function searchNotes(req, res) {
    try {
        const searchTerm = req.query.query;
        if (!searchTerm || searchTerm.trim() === "") {
            return res.status(400).json({ message: "Search term is required" });
        }

        const notes = await Note.find({
            $or: [
                { title: { $regex: searchTerm, $options: "i" } },
                { content: { $regex: searchTerm, $options: "i" } }
            ]
        });
        console.log(notes);
        
        res.json(notes);
    } catch (error) {
        console.log("Error in searching the note", error);
        res.status(500).json({ message: "Server error" })
    }
}
export async function filterByTag(req, res) {
    try {
        const { tag } = req.params;
        const notes = await Note.find({ tags: tag });
        res.json(notes);
    } catch (error) {
        console.log("Error fetching notes by tag:", error)
        res.status(500).json({ message: "Server error" })
    }
}