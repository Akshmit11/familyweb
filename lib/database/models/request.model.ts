import { Document, model, models, Schema } from "mongoose";
import { IUser } from "./user.model";
import { IFamily } from "./family.model";

export interface IRequest extends Document {
  _id: string;
  user: { 
    _id: string, 
    firstName: string, 
    lastName: string, 
    photo: string, 
    username: string, 
    gender: "male" | "female", 
    family: { _id: string, name: string } 
  };
  relative: { 
    _id: string, 
    firstName: string, 
    lastName: string, 
    photo: string, 
    username: string, 
    gender: "male" | "female", 
    family: { _id: string, name: string } 
  };
  relationType: string;
  family: { 
    _id: string, 
    name: string 
  };
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema: Schema<IRequest> = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // ID of the user
  relative: { type: Schema.Types.ObjectId, ref: "User", required: true }, // ID of the relative
  relationType: { type: String, required: true },
  family: { type: Schema.Types.ObjectId, ref: "Family", required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Request = models?.Request || model<IRequest>("Request", RequestSchema);

export default Request;
