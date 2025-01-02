import { Schema, Document, model, models } from "mongoose";
import { IComment } from "./comment.model";

// Define the Post Interface
export interface IPost extends Document {
    _id: string;
    content: string; // Text content of the post
    mediaUrl: string[]; // Array of media file URLs
    visibility: "public" | "family"; // Visibility settings
    createdBy: string; // User ID of the creator
    familyId: string; // Associated family ID
    likes: string[]; // Array of User IDs who liked the post
    comments: IComment[]; // Array of Comment IDs
    createdAt: Date;
    updatedAt: Date;
}

// Post Schema
const PostSchema: Schema<IPost> = new Schema({
    content: { type: String, default: "" },
    mediaUrl: { type: [String], default: [] }, // URLs for photos or videos
    visibility: { type: String, enum: ["public", "family"], default: "family" },
    createdBy: { type: String, required: true }, // User ID
    familyId: { type: String, required: true }, // Family ID
    likes: { type: [String], default: [] }, // User IDs
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment", default: [] }], // References to Comment IDs
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Exporting Post Model
const Post = models?.Post || model<IPost>('Post', PostSchema);

export default Post;
