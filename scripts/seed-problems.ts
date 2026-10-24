import { problems } from './problem-data'
/**
 * Seed script — 50 coding problems across 9 categories
 * Run: npx ts-node --project tsconfig.json scripts/seed-problems.ts
 * Or:  node -r ts-node/register scripts/seed-problems.ts
 */
import mongoose from 'mongoose'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const MONGODB_URI = process.env.MONGODB_URI!

const ProblemSchema = new mongoose.Schema({
  title: String,
  difficulty: String,
  tags: [String],
  description: String,
  starterCode: {
    javascript: String,
    python: String,
    java: String,
    cpp: String,
    typescript: String,
    go: String,
  },
  testCases: [{ input: String, expectedOutput: String, isHidden: Boolean }],
  hints: [String],
  createdAt: { type: Date, default: Date.now },
})

const Problem = mongoose.models.Problem || mongoose.model('Problem', ProblemSchema)

async function main() {
  console.log(`Connecting to MongoDB...`)
  await mongoose.connect(MONGODB_URI)
  console.log('Connected!\n')

  // Upsert by title so seeding never deletes existing problem identities.
  await Problem.bulkWrite(
    problems.map((problem) => ({
      updateOne: {
        filter: { title: problem.title },
        update: { $set: problem },
        upsert: true,
      },
    })),
  )
  const inserted = await Problem.find({ title: { $in: problems.map((problem) => problem.title) } })
  console.log(`\n✅ Seeded ${inserted.length} problems:\n`)

  const byDiff = { Easy: 0, Medium: 0, Hard: 0 }
  inserted.forEach((p: any) => {
    byDiff[p.difficulty as keyof typeof byDiff]++
    console.log(`  ${p.difficulty.padEnd(6)} ${p.title}`)
  })

  console.log(`\nBreakdown: Easy=${byDiff.Easy} Medium=${byDiff.Medium} Hard=${byDiff.Hard}`)
  await mongoose.disconnect()
  console.log('\nDone! 🎉')
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
