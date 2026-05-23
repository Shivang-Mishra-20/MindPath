/**
 * Authentication Context
 * Provides session-based auth state throughout the app.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // true until session is checked

  /**
   * Check for an existing session on initial app load.
   * This prevents flashing the login screen when the user is already logged in.
   */
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await authAPI.checkSession()
        setUser(response.data.user)
      } catch {
        // No active session — stay logged out
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkSession()
  }, [])

  const login = useCallback(async (username, password) => {
    const response = await authAPI.login(username, password)
    setUser(response.data.user)
    return response.data
  }, [])

  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } finally {
      setUser(null)
    }
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
