import { text } from "express";
import mongoose from "mongoose";
// 1- create a schema
// 2- model based off of that schema

const notesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200,
    },
    content: {
      type: String,
      required: true,
      maxLength: 10000,
    },
    tags: [
      {
        type: [String],
        default: [],
        trim: true,
        maxLength: 50,
      },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isTrashed: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    sharedId: {
      type: String,
      default: null,
    },
    
  },
  { timestamps: true }
);
const Note = mongoose.model("Note", notesSchema);
export default Note;
