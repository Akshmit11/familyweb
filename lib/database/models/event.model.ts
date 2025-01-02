import { Schema, Document, model, models } from "mongoose";

export interface IEvent extends Document {
    _id: string;
    name: string;
    description: string;
    date: Date;
    eventDate: Date;
    eventPhoto: string[];
    createdBy: string; // User ID of the event creator
    family: { _id: string, name: string }; // Associated family ID
    attendees: string[]; // Array of User IDs
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema: Schema<IEvent> = new Schema({
    name: { type: String, required: true },
    description: { type: String, default: "" },
    date: { type: Date, required: true },
    eventDate: { type: Date, required: true },
    eventPhoto: { type: [String], default: [] },
    createdBy: { type: String, required: true }, // User ID
    family: { type: Schema.Types.ObjectId, ref: 'Family', required: true }, // Associated Family
    attendees: { type: [String], default: [] }, // User IDs
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Event = models?.Event || model('Event', EventSchema);

export default Event;
