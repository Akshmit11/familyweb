import { Document, model, models, Schema } from "mongoose";
import { IUser } from "./user.model";

export interface IRelationship extends Document {
  _id: string;
  user: { _id: string, firstName: string, lastName: string, photo: string, username: string, gender: "male" | "female"; family: { _id: string, name: string } };
  Pita: IUser[];
  Mata: IUser[];
  JiwanSathi: IUser[];
  Bhai: IUser[];
  Bahen: IUser[];
  Beta: IUser[];
  Beti: IUser[];
  Dada: IUser[];
  Dadi: IUser[];
  Tau: IUser[];
  Tai: IUser[];
  Chacha: IUser[];
  Chachi: IUser[];
  Bua: IUser[];
  Fufa: IUser[];
  Bhatija: IUser[];
  Bhatiji: IUser[];
  Nana: IUser[];
  Nani: IUser[];
  Mama: IUser[];
  Mami: IUser[];
  Mausa: IUser[];
  Mausi: IUser[];
  Bhanja: IUser[];
  Bhanji: IUser[];
  Sala: IUser[];
  Sali: IUser[];
  Sasur: IUser[];
  Saas: IUser[];
  ChacheraBhai: IUser[];
  ChacheriBahen: IUser[];
  MameraBhai: IUser[];
  MameriBahen: IUser[];
  createdAt: Date;
  updatedAt: Date;
}

const RelationshipSchema: Schema<IRelationship> = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  Pita: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Mata: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  JiwanSathi: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Bhai: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Bahen: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Beta: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Beti: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Dada: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Dadi: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Tau: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Tai: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Chacha: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Chachi: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Bua: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Fufa: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Bhatija: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Bhatiji: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Nana: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Nani: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Mama: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Mami: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Mausa: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Mausi: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Bhanja: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Bhanji: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Sala: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Sali: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Sasur: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  Saas: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  ChacheraBhai: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  ChacheriBahen: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  MameraBhai: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  MameriBahen: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Relationship =
  models?.Relationship || model("Relationship", RelationshipSchema);

export default Relationship;
