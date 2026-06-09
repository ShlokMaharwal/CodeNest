import mongoose, { Schema, Document } from 'mongoose'

export interface ITestCase {
  input: string
  expectedOutput: string
  isHidden: boolean
}

export interface IStarterCode {
  javascript: string
  python: string
  java: string
  cpp: string
  typescript: string
  go: string
}

export interface IProblem extends Document {
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  tags: string[]
  description: string
  starterCode: IStarterCode
  testCases: ITestCase[]
  hints: string[]
  createdAt: Date
}

const TestCaseSchema = new Schema<ITestCase>({
  input:          { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden:       { type: Boolean, default: false },
}, { _id: false })

const StarterCodeSchema = new Schema<IStarterCode>({
  javascript: { type: String, default: '' },
  python:     { type: String, default: '' },
  java:       { type: String, default: '' },
  cpp:        { type: String, default: '' },
  typescript: { type: String, default: '' },
  go:         { type: String, default: '' },
}, { _id: false })

const ProblemSchema = new Schema<IProblem>({
  title:       { type: String, required: true },
  difficulty:  { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  tags:        [{ type: String }],
  description: { type: String, required: true },
  starterCode: { type: StarterCodeSchema, required: true },
  testCases:   [TestCaseSchema],
  hints:       [{ type: String }],
  createdAt:   { type: Date, default: Date.now },
})

ProblemSchema.index({ title: 'text', tags: 'text' })
ProblemSchema.index({ difficulty: 1 })

export const ProblemModel = mongoose.models.Problem || mongoose.model<IProblem>('Problem', ProblemSchema)
