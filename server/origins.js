function allowedOrigins(env) {
  return (env.SOCKET_ALLOWED_ORIGINS || new URL(env.NEXTAUTH_URL).origin)
    .split(',')
    .map((value) => value.trim())
}
function isAllowedOrigin(origin, env) {
  return typeof origin === 'string' && allowedOrigins(env).includes(origin)
}
module.exports = { allowedOrigins, isAllowedOrigin }
