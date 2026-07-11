import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authClient, authConfigured } from './auth'

const AuthContext = createContext(null)

function authError(message) {
  return new Error(message || 'Something went wrong. Try again.')
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshSession = useCallback(async () => {
    if (!authClient) {
      setUser(null)
      setSession(null)
      setLoading(false)
      return null
    }

    const result = await authClient.getSession()
    if (result.error) {
      setUser(null)
      setSession(null)
      setLoading(false)
      return null
    }

    const nextSession = result.data?.session ?? null
    const nextUser = result.data?.user ?? null
    setSession(nextSession)
    setUser(nextUser)
    setLoading(false)
    return { session: nextSession, user: nextUser }
  }, [])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  const signIn = useCallback(
    async ({ email, password }) => {
      if (!authClient) {
        throw authError(
          'Neon Auth is not set up yet. Add VITE_NEON_AUTH_URL to the frontend .env file.',
        )
      }
      const result = await authClient.signIn.email({ email, password })
      if (result.error) throw authError(result.error.message)
      await refreshSession()
      return result.data
    },
    [refreshSession],
  )

  const signUp = useCallback(
    async ({ name, email, password }) => {
      if (!authClient) {
        throw authError(
          'Neon Auth is not set up yet. Add VITE_NEON_AUTH_URL to the frontend .env file.',
        )
      }
      const result = await authClient.signUp.email({
        name: name?.trim() || email.split('@')[0] || 'Rider',
        email,
        password,
      })
      if (result.error) throw authError(result.error.message)
      await refreshSession()
      return result.data
    },
    [refreshSession],
  )

  const signOut = useCallback(async () => {
    if (authClient) await authClient.signOut()
    setUser(null)
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      configured: authConfigured,
      signIn,
      signUp,
      signOut,
      refreshSession,
      riderId: user?.id || 'anonymous',
    }),
    [user, session, loading, signIn, signUp, signOut, refreshSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
