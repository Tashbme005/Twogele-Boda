import { createAuthClient } from '@neondatabase/neon-js/auth'

const authUrl = (import.meta.env.VITE_NEON_AUTH_URL || '').trim()

export const authConfigured = Boolean(authUrl)

export const authClient = authConfigured ? createAuthClient(authUrl) : null
