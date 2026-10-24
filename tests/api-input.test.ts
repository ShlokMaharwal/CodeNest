import { expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { readJSON, inputErrorResponse } from '@/lib/api'
import nextConfig from '../next.config'

it('rejects malformed JSON, wrong content types and oversized request bodies', async () => {
  const schema = z.object({ code: z.string() })
  const req = (body: string, type = 'application/json') =>
    new NextRequest('http://localhost/api/execute', {
      method: 'POST',
      body,
      headers: { 'content-type': type },
    })
  await expect(readJSON(req('{broken'), schema)).rejects.toMatchObject({ status: 400 })
  await expect(readJSON(req('{}', 'text/plain'), schema)).rejects.toMatchObject({ status: 415 })
  await expect(
    readJSON(req(JSON.stringify({ code: 'x'.repeat(256001) })), schema),
  ).rejects.toMatchObject({ status: 413 })
  expect(inputErrorResponse(new Error('private'))).toBeNull()
})

it('returns parsed values and exposes schema errors safely', async () => {
  const req = new NextRequest('http://localhost/api/test', {
    method: 'POST',
    body: '{"value":2}',
    headers: { 'content-type': 'application/json' },
  })
  expect(await readJSON(req, z.object({ value: z.number() }))).toEqual({ value: 2 })
  expect(inputErrorResponse(new z.ZodError([]))?.status).toBe(400)
})

it('sets response headers without restricting the existing editor assets', async () => {
  const [rule] = await nextConfig.headers!()
  expect(rule.headers).toEqual(
    expect.arrayContaining([
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      {
        key: 'Content-Security-Policy',
        value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
      },
    ]),
  )
})
