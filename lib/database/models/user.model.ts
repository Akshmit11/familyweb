import { Schema, Document, model, models } from "mongoose";
import { IPost } from "./post.model";
import { IFamily } from "./family.model";
import { IRelationship } from "./relationship.model";

export interface IUser {
    _id: string;
    clerkId: string;
    firstName: string;
    lastName: string;
    photo: string;
    email: string;
    username: string;
    phoneNumber: string;
    countryCode: string;
    showPhoneNumber: boolean;
    country: string;
    city: string;
    state: string;
    coverPhoto: string;
    status: string;
    gender: "male" | "female";
    dob: Date;
    posts: IPost[];
    isProfileCompleted: boolean;
    isPhoneVerified: boolean;
    family: { _id: string, name: string };
    father: string | null; // ObjectId or null if not set
    mother: string | null; // ObjectId or null if not set
    spouse: string | null; // ObjectId or null if not set
    brother: string[]; // Array of ObjectIds
    sister: string[]; // Array of ObjectIds
    son: string[]; // Array of ObjectIds
    daughter: string[]; // Array of ObjectIds
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema({
  clerkId: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  photo: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true, trim: true },
  phoneNumber: { type: String, default: "" },
  countryCode: { type: String, default: "" },
  showPhoneNumber: { type: Boolean, default: false },
  country: { type: String, default: "" },
  city: { type: String, default: "" },
  state: { type: String, default: "" },
  coverPhoto: { type: String, default: "" },
  status: { type: String, default: "" },
  gender: { type: String, enum: ["male", "female"], default: null },
  dob: { type: Date, default: null },
  posts: [{ type: Schema.Types.ObjectId, ref: "Post", default: [] }],
  isProfileCompleted: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  family: { type: Schema.Types.ObjectId, ref: 'Family', default: null },
  father: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  mother: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  spouse: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  brother: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  sister: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  son: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  daughter: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = models?.User || model('User', UserSchema)

export default User;