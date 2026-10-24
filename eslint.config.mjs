import { FlatCompat } from '@eslint/eslintrc'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const compat = new FlatCompat({ baseDirectory: path.dirname(fileURLToPath(import.meta.url)) })
const config = [
  { ignores: ['.next/**', 'node_modules/**', 'coverage/**', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  { files: ['**/*.js', '**/*.cjs'], rules: { '@typescript-eslint/no-require-imports': 'off' } },
  {
    rules: {
      // Existing UI and Mongoose boundaries use dynamic data; narrow them as touched.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Keep the existing literal UI copy unchanged.
      'react/no-unescaped-entities': 'off',
    },
  },
]

export default config
