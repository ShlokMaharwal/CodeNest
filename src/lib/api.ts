import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export class InputError extends Error {
  constructor(
    message = 'Invalid request',
    public status = 400,
  ) {
    super(message)
  }
}
export async function readJSON<T extends z.ZodTypeAny>(
  req: NextRequest,
  schema: T,
): Promise<z.infer<T>> {
  if (!req.headers.get('content-type')?.includes('application/json'))
    throw new InputError('Content-Type must be application/json', 415)
  const reader = req.body?.getReader()
  if (!reader) throw new InputError('Request body is required')
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 256000) {
        await reader.cancel()
        throw new InputError('Request body too large', 413)
      }
      chunks.push(value)
    }
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    const result = schema.safeParse(body)
    if (!result.success)
      throw new InputError(
        'Invalid request: ' + result.error.issues.map((issue) => issue.path.join('.')).join(', '),
      )
    return result.data
  } catch (error) {
    if (error instanceof InputError) throw error
    throw new InputError('Malformed JSON')
  } finally {
    reader.releaseLock()
  }
}
export function inputErrorResponse(error: unknown): NextResponse | null {
  if (error instanceof InputError)
    return NextResponse.json({ error: error.message }, { status: error.status })
  if (error instanceof z.ZodError)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  return null
}
