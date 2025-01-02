import { Document, model, models, Schema } from "mongoose";

export interface IRelationship extends Document {
  _id: string;
  user: { _id: string, firstName: string, lastName: string, photo: string, username: string, gender: "male" | "female"; family: { _id: string, name: string } }; // The ID of the user creating the relationship
  relative: { _id: string, firstName: string, lastName: string, photo: string, username: string, gender: "male" | "female"; family: { _id: string, name: string } }; // The ID of the related user
  relationType: string; // Type of relation (e.g., "father", "daughter’s husband")
  family: { _id: string, name: string }; // Family ID to group the relationships
  status: "pending" | "accepted" | "rejected"; // "pending", "accepted", "rejected"
  createdAt: Date;
  updatedAt: Date;
}

const RelationshipSchema: Schema<IRelationship> = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // ID of the user
  relative: { type: Schema.Types.ObjectId, ref: "User", required: true }, // ID of the relative
  relationType: { type: String, required: true }, // e.g., "father", "mother"
  family: { type: Schema.Types.ObjectId, ref: "Family", required: true }, // Family ID
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  }, // "pending", "accepted", "rejected"
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Relationship =
  models?.Relationship || model("Relationship", RelationshipSchema);

export default Relationship;
