
import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  color: string
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  color: {
    type: String,
    default: () => {
      const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
      return colors[Math.floor(Math.random() * colors.length)]
    },
  },
  createdAt: { type: Date, default: Date.now },
})

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
