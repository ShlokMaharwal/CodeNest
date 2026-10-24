# CodeNest resume notes

Measured on 24 October 2026. These are observations of this repository and the linked CI run, not production traffic measurements or claimed improvements.

| Metric                            | Measured result             | Method / scope                                                                                                                                                |
| --------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Passing tests                     | 113                         | Vitest JSON report; unit, API, and actual Socket.io integration connections                                                                                   |
| Backend line coverage             | 79.82%                      | V8 coverage: `src/lib/**`, `src/app/api/**`, `server/**`                                                                                                      |
| Backend statement coverage        | 75.54%                      | Same V8 report                                                                                                                                                |
| Backend branch coverage           | 66.82%                      | Same V8 report                                                                                                                                                |
| API route paths                   | 12                          | Count of route.ts files under src/app/api                                                                                                                     |
| Client socket events              | 16                          | Registered input events; excludes disconnect lifecycle                                                                                                        |
| Catalog problems                  | 49                          | Exported seed fixtures                                                                                                                                        |
| Problems with grading cases       | 35                          | Nonempty seed test-case arrays                                                                                                                                |
| Seeded test cases                 | 58                          | Sum of fixture case counts                                                                                                                                    |
| Local execution latency p50 / p95 | Unavailable                 | Live Wandbox compile attempt returned TIMEOUT; no complete successful sample set, so no percentile is reported                                                |
| Docker image size, uncompressed   | 811.7 MiB (851104960 bytes) | Docker image inspect in CI [40099767729](https://github.com/ShlokMaharwal/CodeNest/actions/runs/40099767729), commit fd5cea85c6e6f6de801fe1f6389d36745a2f879a |
| CI verification job duration      | 129 seconds                 | Completed job timestamps in CI [40099767729](https://github.com/ShlokMaharwal/CodeNest/actions/runs/40099767729)                                              |

The coverage scope includes backend modules and API routes; it does not measure the React UI or the custom process entrypoint. MongoDB, Redis, and providers are mocked in automated tests. Container verification starts real MongoDB, Redis, and the app and checks /api/health. The linked CI run verified the full stack.

The live latency attempt used the local executeCode client with a fixed JavaScript console.log(42) program, including network and provider time. Use `npx tsx scripts/benchmark-execution.ts` to collect a fresh sequential sample; retain failures rather than substituting mock timings. Coverage and test JSON are generated under coverage/ and uploaded by CI.

## Draft resume bullets

- Built CodeNest, a role-based coding interview platform with Next.js, Socket.io, Redis, MongoDB, shared editing controls, AI hints, and persisted replay snapshots.
- Enforced authenticated room membership, single-user JWT invites, Redis rate limits, bounded code execution, and validated API/AI data across 12 API route paths and 16 client socket events.
- Implemented hidden-case grading against 58 seeded cases across 35 problems, plus timestamped integrity reports and room-state recovery after reconnect.
- Verified backend behavior with 113 passing unit, API, and socket integration tests and 79.82% backend line coverage, using mocked providers and persistence boundaries.
- Packaged the custom server with MongoDB and Redis in a non-root Docker stack and added GitHub Actions checks for types, lint, tests, coverage, production build, and container health.
