import { validateEnv } from './env-schema'

export const env = validateEnv(process.env)
