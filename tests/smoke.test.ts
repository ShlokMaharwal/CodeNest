import { expect, test } from 'vitest'
import { cn } from '@/lib/cn'

test('joins conditional class names', () => {
  expect(cn('base', false && 'hidden', { active: true })).toBe('base active')
})
