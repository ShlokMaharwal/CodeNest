import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IRoom extends Document {
  roomId: string
  title: string
  createdBy: string
  status: 'waiting' | 'active' | 'ended'
  language: string
  problemId?: Types.ObjectId
  hintsEnabled: boolean
  maxHints: number
  durationMinutes: number
  inviteToken: string
  candidateName?: string
  candidateEmail?: string
  candidatePhone?: string
  candidatePosition?: string
  candidateLinkedin?: string
  experienceLevel?: 'junior' | 'mid' | 'senior' | 'staff' | 'principal'
  description?: string
  scheduledAt?: Date
  createdAt: Date
  expiresAt: Date
  endedAt?: Date
}

const RoomSchema = new Schema<IRoom>({
  roomId:             { type: String, required: true, unique: true },
  title:              { type: String, required: true, default: 'Interview Session' },
  createdBy:          { type: String, required: true },
  status:             { type: String, enum: ['waiting', 'active', 'ended'], default: 'waiting' },
  language:           { type: String, default: 'javascript' },
  problemId:          { type: Schema.Types.ObjectId, ref: 'Problem', required: false },
  hintsEnabled:       { type: Boolean, default: true },
  maxHints:           { type: Number, default: 5 },
  durationMinutes:    { type: Number, default: 45 },
  inviteToken:        { type: String, required: true },
  candidateName:      { type: String },
  candidateEmail:     { type: String },
  candidatePhone:     { type: String },
  candidatePosition:  { type: String },
  candidateLinkedin:  { type: String },
  experienceLevel:    { type: String, enum: ['junior', 'mid', 'senior', 'staff', 'principal'] },
  description:        { type: String },
  scheduledAt:        { type: Date },
  createdAt:          { type: Date, default: Date.now },
  expiresAt:          { type: Date, required: true },
  endedAt:            { type: Date },
})

RoomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const RoomModel = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema)
