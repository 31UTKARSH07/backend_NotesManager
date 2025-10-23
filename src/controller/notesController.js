import Note from "../models/Note.js";

// Get all notes
export async function getAllNotes(req, res) {
  try {
    console.log(req.user)
    const notes = await Note.find({userId:req.user.id}).sort({
      createdAt: -1,
    });
    
    console.log("Found notes:", notes.length);
    res.status(200).json(notes);
  } catch (error) {
    console.log("Error in getAllNotes controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Create a new note
export async function createNotes(req, res) {
  try {
    const { title, content, tags } = req.body;
    console.log("title: " + title + " content: " + content + " tags: " + tags);
    // Simple validation
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }
    const note = new Note({
      title: title,
      content: content,
      tags: tags || [], // Use tags from request, or empty array if not provided
      userId: req.user.id
    });
    console.log("Creating note:", note);
    

    const savedNote = await note.save();
    console.log("Note created successfully:", savedNote._id);
    res.status(201).json(savedNote);
  } catch (error) {
    console.error("Error in createNotes controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Update an existing note
export async function updateNotes(req, res) {
  try {
    const { title, content, tags } = req.body;
    const noteId = req.params.id;

    // Find and update the note
    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      {
        title: title,
        content: content,
        tags: tags,
        updatedAt: new Date(),
      },
      { new: true } // Return the updated document
    );

    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    console.log("Note updated successfully:", updatedNote._id);
    res.status(200).json(updatedNote);
  } catch (error) {
    console.error("Error in updateNotes controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Delete a note
export async function deleteNotes(req, res) {
  try {
    const noteId = req.params.id;

    const deletedNote = await Note.findByIdAndDelete(noteId);
    
    if (!deletedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    console.log("Note deleted successfully:", deletedNote._id);
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error in deleteNotes controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get a single note by ID
export async function getNoteById(req, res) {
  try {
    const noteId = req.params.id;

    const note = await Note.findById(noteId);
    
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    console.log("Note found:", note._id);
    res.status(200).json(note);
  } catch (error) {
    console.error("Error in getNoteById controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Search notes (optional - you can remove if not needed)
export async function searchNotes(req, res) {
  try {
    const searchTerm = req.query.query;

    if (!searchTerm || searchTerm.trim() === "") {
      return res.status(400).json({ message: "Search term is required" });
    }

    const notes = await Note.find({
      $or: [
        { title: { $regex: searchTerm, $options: "i" } },
        { content: { $regex: searchTerm, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    console.log("Search results found:", notes.length);
    res.status(200).json(notes);
  } catch (error) {
    console.log("Error in searchNotes controller:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Filter notes by tag (optional - you can remove if not needed)
export async function filterByTag(req, res) {
  try {
    const { tag } = req.params;

    const notes = await Note.find({
      tags: { $in: [new RegExp(tag, "i")] },
    }).sort({ createdAt: -1 });

    console.log("Notes found with tag:", notes.length);
    res.status(200).json(notes);
  } catch (error) {
    console.log("Error in filterByTag controller:", error);
    res.status(500).json({ message: "Server error" });
  }
}