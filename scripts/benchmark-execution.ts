import { performance } from 'node:perf_hooks'
import { writeFileSync, mkdirSync } from 'node:fs'
import { executeCode } from '../src/lib/wandbox'

async function main() {
  const measurements: number[] = []
  const failures: string[] = []
  for (let index = 0; index < 10; index++) {
    const started = performance.now()
    const result = await executeCode('console.log(42)', 'javascript')
    const elapsed = performance.now() - started
    if (result.status !== 'Accepted' || result.stdout?.trim() !== '42') {
      failures.push(result.errorCode || result.status)
      console.log(
        'Execution measurement unavailable: ' + result.status + ' ' + (result.errorCode || ''),
      )
      break
    }
    measurements.push(Number(elapsed.toFixed(2)))
    console.log('Execution sample ' + (index + 1) + ': ' + elapsed.toFixed(2) + ' ms')
  }
  const sorted = [...measurements].sort((a, b) => a - b)
  const percentile = (fraction: number) =>
    sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)] ?? null
  const record = {
    measuredAt: new Date().toISOString(),
    method:
      'Local executeCode client to live Wandbox, console.log(42), JavaScript, sequential requests including network and retries',
    samples: measurements,
    failures,
    p50: percentile(0.5),
    p95: percentile(0.95),
  }
  mkdirSync('coverage', { recursive: true })
  writeFileSync('coverage/benchmark.json', JSON.stringify(record, null, 2) + '\n')
  console.log(JSON.stringify(record))
}
main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
