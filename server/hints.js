const RESERVE = `local n = tonumber(redis.call('HGET', KEYS[1], ARGV[1]) or ARGV[3])
if n >= tonumber(ARGV[2]) then return -1 end
redis.call('HSET', KEYS[1], ARGV[1], n + 1)
redis.call('EXPIRE', KEYS[1], 604800)
return n + 1`

async function reserveHint(redis, roomId, email, maxHints, previous = 0) {
  return Number(
    await redis.eval(RESERVE, 1, 'room:' + roomId + ':hints', email, maxHints, previous),
  )
}
async function releaseHint(redis, roomId, email) {
  await redis.eval(
    `local n = tonumber(redis.call('HGET', KEYS[1], ARGV[1]) or '0')
if n > 0 then return redis.call('HINCRBY', KEYS[1], ARGV[1], -1) end
return 0`,
    1,
    'room:' + roomId + ':hints',
    email,
  )
}
async function saveHint(redis, roomId, email, hint) {
  await redis.eval(
    `local list = cjson.decode(redis.call('HGET', KEYS[1], ARGV[1]) or '[]')
table.insert(list, ARGV[2])
redis.call('HSET', KEYS[1], ARGV[1], cjson.encode(list))
return redis.call('EXPIRE', KEYS[1], 604800)`,
    1,
    'room:' + roomId + ':hint-texts',
    email,
    hint,
  )
}
async function getCandidateHints(redis, roomId, email, state = {}) {
  const [count, texts] = await Promise.all([
    redis.hget('room:' + roomId + ':hints', email),
    redis.hget('room:' + roomId + ':hint-texts', email),
  ])
  return {
    count: count === null ? state.hintsPerCandidate?.[email] || 0 : Number(count),
    texts: texts === null ? state.hintsTextPerCandidate?.[email] || [] : JSON.parse(texts),
  }
}
module.exports = { reserveHint, releaseHint, saveHint, getCandidateHints }
