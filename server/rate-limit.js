const WINDOW = `local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return {count, redis.call('TTL', KEYS[1])}`

async function consumeRateLimit(redis, key, limit, windowSeconds) {
  const [count, ttl] = await redis.eval(WINDOW, 1, key, windowSeconds)
  return {
    allowed: Number(count) <= limit,
    count: Number(count),
    remaining: Math.max(0, limit - Number(count)),
    retryAfter: Math.max(1, Number(ttl)),
  }
}
module.exports = { consumeRateLimit }
