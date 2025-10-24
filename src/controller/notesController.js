import Note from "../models/Note.js";
import { v4 as uuidv4 } from 'uuid';

// Get all notes
export async function getAllNotes(req, res) {
  try {
    const notes = await Note.find({
      userId: req.user.id,
      isArchived: false,
      isTrashed: false,
    }).sort({ createdAt: -1 });
    console.log("Found active notes:", notes.length);
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in getAllNotes controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function shareNote(req, res) {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    
    if (!note.sharedId) {
      note.sharedId = uuidv4();
      await note.save();
    }
    
    return res.json({ sharedId: note.sharedId });
  } catch (error) {
    console.error("Error in shareNote:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSharedNote(req, res) {
  try {
    const { sharedId } = req.params;
    const note = await Note.findOne({ sharedId: sharedId });
    
    if (!note || note.isTrashed) {
      return res.status(404).json({ 
        message: "Note not found or is no longer shared" 
      });
    }
    
    res.status(200).json({
      title: note.title,
      content: note.content,
      tags: note.tags,
      updatedAt: note.updatedAt,
    });
  } catch (error) {
    console.error("Error in getSharedNote:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createNotes(req, res) {
  try {
    const { title, content, tags } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ 
        message: "Title and content are required" 
      });
    }
    
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: req.user.id,
    });

    const savedNote = await note.save();
    console.log("Note created successfully:", savedNote._id);
    res.status(201).json(savedNote);
  } catch (error) {
    console.error("Error in createNotes controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateNotes(req, res) {
  try {
    const { title, content, tags } = req.body;
    const noteId = req.params.id;

    // FIX: Verify ownership before updating
    const updatedNote = await Note.findOneAndUpdate(
      { _id: noteId, userId: req.user.id }, // Added userId check
      {
        title,
        content,
        tags,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ 
        message: "Note not found or you don't have permission" 
      });
    }

    console.log("Note updated successfully:", updatedNote._id);
    res.status(200).json(updatedNote);
  } catch (error) {
    console.error("Error in updateNotes controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteNotes(req, res) {
  try {
    const noteId = req.params.id;

    // FIX: Verify ownership before deleting
    const deletedNote = await Note.findOneAndDelete({
      _id: noteId,
      userId: req.user.id, // Added userId check
    });

    if (!deletedNote) {
      return res.status(404).json({ 
        message: "Note not found or you don't have permission" 
      });
    }

    console.log("Note deleted successfully:", deletedNote._id);
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error in deleteNotes controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getNoteById(req, res) {
  try {
    const noteId = req.params.id;
    
    // FIX: Verify ownership before returning
    const note = await Note.findOne({
      _id: noteId,
      userId: req.user.id, // Added userId check
    });
    
    if (!note) {
      return res.status(404).json({ 
        message: "Note not found or you don't have permission" 
      });
    }
    
    console.log("Note found:", note._id);
    res.status(200).json(note);
  } catch (error) {
    console.error("Error in getNoteById controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function searchNotes(req, res) {
  try {
    const searchTerm = req.query.query;
    
    if (!searchTerm || searchTerm.trim() === "") {
      return res.status(400).json({ message: "Search term is required" });
    }
    
    // FIX: Added userId filter to search only user's notes
    const notes = await Note.find({
      userId: req.user.id, // Added this!
      isArchived: false,
      isTrashed: false,
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

export async function toggleArchive(req, res) {
  try {
    const notesId = req.params.id;
    const userId = req.user.id;

    const note = await Note.findOne({ _id: notesId, userId: userId });
    
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    
    note.isArchived = !note.isArchived;
    await note.save();
    
    return res.json({ success: true, note });
  } catch (error) {
    console.log("Archived error", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function moveToTrash(req, res) {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    note.isTrashed = true;
    await note.save();

    res.json({ success: true, message: "Note moved to Trash" });
  } catch (error) {
    console.error("Error in moveToTrash:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getArchivedNotes(req, res) {
  try {
    const archivedNotes = await Note.find({
      userId: req.user.id,
      isArchived: true,
      isTrashed: false,
    }).sort({ updatedAt: -1 });
    
    res.status(200).json(archivedNotes);
  } catch (error) {
    console.error("Error fetching archived notes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function filterByTag(req, res) {
  try {
    const { tag } = req.params;
    
    // FIX: Added userId filter to search only user's notes
    const notes = await Note.find({
      userId: req.user.id, // Added this!
      isArchived: false,
      isTrashed: false,
      tags: { $in: [new RegExp(tag, "i")] },
    }).sort({ createdAt: -1 });

    console.log("Notes found with tag:", notes.length);
    res.status(200).json(notes);
  } catch (error) {
    console.log("Error in filterByTag controller:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function restoreNote(req, res) {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    note.isTrashed = false;
    await note.save();

    res.json({ 
      success: true, 
      message: "Note restored successfully", 
      note 
    });
  } catch (error) {
    console.error("Error in restoreNote:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deletePermanently(req, res) {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
      isTrashed: true,
    });

    if (!note) {
      return res.status(404).json({ 
        message: "Note not found or not in Trash" 
      });
    }

    res.json({ success: true, message: "Note permanently deleted" });
  } catch (error) {
    console.error("Error in deletePermanently:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getTrashedNotes(req, res) {
  try {
    const trashedNotes = await Note.find({
      userId: req.user.id,
      isTrashed: true,
    }).sort({ updatedAt: -1 });

    res.status(200).json(trashedNotes);
  } catch (error) {
    console.error("Error fetching trashed notes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}