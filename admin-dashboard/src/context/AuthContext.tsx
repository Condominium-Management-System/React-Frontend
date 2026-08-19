import { useState, useEffect, type ReactNode } from 'react'
import type { User, LoginCredentials } from '../services/types/auth'
import {
  AuthContext,
} from './AuthContextDefinition'
import {
  loginApi,
  logoutApi,
  getStoredSession,
  saveStoredSession,
  clearStoredSession,
} from '../services/api/apiClient'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Restore stored session on app startup
  useEffect(() => {
    const session = getStoredSession()
    if (session && session.accessToken && session.user) {
      setUser(session.user)
      setAccessToken(session.accessToken)
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  // Login handler
  const login = async (
    credentials: LoginCredentials,
    rememberMe: boolean
  ): Promise<void> => {
    const response = await loginApi(credentials)
    const { accessToken: token, refreshToken, user: userData } = response.data

    const session = {
      accessToken: token,
      refreshToken,
      user: userData,
      rememberMe,
    }

    saveStoredSession(session)

    setUser(userData)
    setAccessToken(token)
    setIsAuthenticated(true)
  }

  // Logout handler
  const logout = async (): Promise<void> => {
    try {
      await logoutApi()
    } finally {
      clearStoredSession()
      setUser(null)
      setAccessToken(null)
      setIsAuthenticated(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
