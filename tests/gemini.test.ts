import { beforeEach, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ generate: vi.fn(), model: vi.fn() }))
vi.mock('@/lib/env', () => ({
  env: { GEMINI_API_KEY: 'test-key', GEMINI_MODEL: 'configured-model' },
}))
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel(...args: unknown[]) {
      mocks.model(...args)
      return { generateContent: mocks.generate }
    }
  },
}))
import { generateReview, callGemini } from '@/lib/gemini'
const input = {
  problemTitle: 'Sum',
  problemDescription: '',
  code: 'x',
  language: 'javascript',
  testResults: [],
}
const valid = {
  correctness: 'Correct',
  codeQuality: 'Readable',
  problemSolving: 'Linear',
  communication: 'Clear',
  recommendation: 'Hire',
  justification: 'Works',
}
beforeEach(() => vi.clearAllMocks())
it('uses the configured model and returns compatible markdown from validated JSON', async () => {
  mocks.generate.mockResolvedValue({ response: { text: () => JSON.stringify(valid) } })
  expect(await generateReview(input)).toMatchObject({
    structured: valid,
    review: expect.stringContaining('**Recommendation**: Hire'),
  })
  expect(mocks.model).toHaveBeenCalledWith(
    expect.objectContaining({
      model: 'configured-model',
      generationConfig: { responseMimeType: 'application/json' },
    }),
    { timeout: 10000 },
  )
})
it.each(['not json', '{}', JSON.stringify({ ...valid, recommendation: 'Guaranteed hire' })])(
  'rejects invalid reviews: %s',
  async (output) => {
    mocks.generate.mockResolvedValue({ response: { text: () => output } })
    await expect(generateReview(input)).rejects.toThrow()
  },
)
it('propagates provider failures and rejects empty output', async () => {
  mocks.generate.mockRejectedValueOnce(new Error('offline'))
  await expect(callGemini('prompt')).rejects.toThrow('offline')
  mocks.generate.mockResolvedValue({ response: { text: () => '' } })
  await expect(callGemini('prompt')).rejects.toThrow('Invalid AI response')
})
