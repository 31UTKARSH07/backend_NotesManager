import mongoose from "mongoose";
// 1- create a schema
// 2- model based off of that schema

const notesSchema = new mongoose.Schema(
{
    title:{
    type:String,
    required: true,
    },
    content: {
    type:String,
    required:true,
    },
    tags:{
        type:[String],
        default:[],
    },
},
{timestamps:true}
)
const Note = mongoose.model("Note",notesSchema)
export default Note;