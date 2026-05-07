
import mongoose, { Schema, Document } from 'mongoose'

export interface IRoom extends Document {
  roomId: string
  title: string
  createdBy: string
  language: string
  code: string
  isActive: boolean
  createdAt: Date
}

const RoomSchema = new Schema<IRoom>({
  roomId: { type: String, required: true, unique: true },
  title: { type: String, required: true, default: 'Untitled Session' },
  createdBy: { type: String, required: true },
  language: { type: String, default: 'javascript' },
  code: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

export const RoomModel = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema)
