import mongoose, { Schema, Document } from 'mongoose'

export interface ITestResult {
  input: string
  expected: string
  actual: string
  passed: boolean
}

export interface ISnapshot extends Document {
  roomId: string
  code: string
  language: string
  hintsUsed: number
  testResults: ITestResult[]
  aiReview?: string
  timestamp: Date
  trigger: 'auto' | 'execution' | 'manual' | 'end'
}

const TestResultSchema = new Schema<ITestResult>({
  input:    { type: String, default: '' },
  expected: { type: String, default: '' },
  actual:   { type: String, default: '' },
  passed:   { type: Boolean, default: false },
}, { _id: false })

const SnapshotSchema = new Schema<ISnapshot>({
  roomId:     { type: String, required: true, index: true },
  code:       { type: String, default: '' },
  language:   { type: String, default: 'javascript' },
  hintsUsed:  { type: Number, default: 0 },
  testResults: [TestResultSchema],
  aiReview:   { type: String },
  timestamp:  { type: Date, default: Date.now },
  trigger:    { type: String, enum: ['auto', 'execution', 'manual', 'end'], default: 'auto' },
})

export const SnapshotModel = mongoose.models.Snapshot || mongoose.model<ISnapshot>('Snapshot', SnapshotSchema)
