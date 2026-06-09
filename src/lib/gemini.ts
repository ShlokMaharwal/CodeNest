import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function callGemini(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const result = await model.generateContent(prompt)
  const response = result.response
  return response.text()
}

export function buildHintPrompt(params: {
  problemTitle: string
  problemDescription: string
  code: string
  language: string
  hintsUsed: number
}): string {
  return `You are a coding interview assistant helping a candidate.

Problem: ${params.problemTitle}
Description: ${params.problemDescription}

Candidate's current code (${params.language}):
\`\`\`${params.language}
${params.code || '(empty)'}
\`\`\`

Hints given so far: ${params.hintsUsed}

Give ONE short directional hint to guide the candidate.
Rules:
- Do NOT write any code or pseudocode
- Do NOT solve the problem or give away the answer
- Be encouraging and concise (maximum 3 sentences)
- If this is hint #${params.hintsUsed + 1}, make it slightly more specific than previous hints would have been`
}

export function buildReviewPrompt(params: {
  problemTitle: string
  problemDescription: string
  code: string
  language: string
  testResults: { input: string; expected: string; actual: string; passed: boolean }[]
}): string {
  const passedCount = params.testResults.filter((r) => r.passed).length
  const totalCount = params.testResults.length

  return `You are a senior software engineer reviewing code from a technical interview.

Problem: ${params.problemTitle}
Description: ${params.problemDescription}

Candidate's solution (${params.language}):
\`\`\`${params.language}
${params.code}
\`\`\`

Test results: ${passedCount}/${totalCount} tests passed
${params.testResults.map((r, i) => `  Case ${i + 1}: ${r.passed ? '✅' : '❌'} Input: ${r.input} | Expected: ${r.expected} | Got: ${r.actual}`).join('\n')}

Provide a structured review with these exact sections:
1. **Time Complexity**: Big-O with explanation
2. **Space Complexity**: Big-O with explanation
3. **Edge Cases Missed**: List any edge cases the solution doesn't handle
4. **Code Quality**: Comments on naming, readability, structure
5. **Overall Assessment**: One of: Strong Hire ✅ / Hire ✅ / Borderline ⚠️ / No Hire ❌ with a one-sentence justification

Be direct and concise. No pleasantries.`
}
