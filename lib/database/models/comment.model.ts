import { Schema, Document, model, models } from "mongoose";
// Define the Comment Interface
export interface IComment extends Document {
    _id: string;
    postId: string; // Associated Post ID
    user: { _id: string, firstName: string, lastName: string, photo: string }; // User who made the comment
    text: string; // Comment text
    parentComment?: { _id: string, text: string }; // For replies, reference to parent comment
    createdAt: Date;
    updatedAt: Date;
}

// Comment Schema
const CommentSchema: Schema<IComment> = new Schema({
    postId: { type: String, required: true }, // Associated Post ID
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // User ID
    text: { type: String, required: true }, // Comment text
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment', default: null }, // Parent comment ID (if it's a reply)
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Exporting Comment Model
const Comment = models?.Comment || model<IComment>('Comment', CommentSchema);

export default Comment;
