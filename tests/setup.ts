Object.assign(process.env, {
  MONGODB_URI: 'mongodb://localhost:27017/codenest-test',
  REDIS_URL: 'redis://localhost:6379',
  NEXTAUTH_URL: 'http://localhost:3000',
  NEXTAUTH_SECRET: 'test-nextauth-secret-with-at-least-32-characters',
  INVITE_TOKEN_SECRET: 'test-invite-secret-with-at-least-32-characters',
})
