import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { setAuthTokens, clearAuthTokens, getStoredTokens } from './apiClient'

type AuthTokens = {
  accessToken: string
  refreshToken: string
}

type AuthContextValue = {
  isAuthenticated: boolean
  tokens: AuthTokens | null
  login: (tokens: AuthTokens) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<AuthTokens | null>(() => getStoredTokens())

  useEffect(() => {
    if (tokens) {
      setAuthTokens(tokens.accessToken, tokens.refreshToken)
    } else {
      clearAuthTokens()
    }
  }, [tokens])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: tokens != null,
      tokens,
      login: nextTokens => {
        setTokens(nextTokens)
      },
      logout: () => {
        setTokens(null)
      },
    }),
    [tokens],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

