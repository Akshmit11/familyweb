import { Schema, Document, model, models } from "mongoose";
import { IUser } from "./user.model";

export interface IFamily extends Document {
    _id: string;
    name: string;
    description: string;
    members: IUser[]; // Array of User IDs
    createdBy: { _id: string, firstName: string, lastName: string, photo: string }; // User ID of the creator
    createdAt: Date;
    updatedAt: Date;
}

const FamilySchema: Schema<IFamily> = new Schema({
    name: { type: String, required: true },
    description: { type: String, default: "" },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Fixed array syntax
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // User ID
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Family = models?.Family || model('Family', FamilySchema);

export default Family;
