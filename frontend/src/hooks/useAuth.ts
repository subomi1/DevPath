import { useState, useCallback } from 'react'
import client from '../api/client'
import type { User } from '../types/user'

interface LoginResponse {
  access: string
  refresh: string
  user: User
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback(async (email: string, password: string) => {
    const response = await client.post<LoginResponse>('/auth/login/', { email, password })
    const { access, refresh, user } = response.data

    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    localStorage.setItem('user', JSON.stringify(user))

    setUser(user)
    return user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  return { user, login, logout, isAuthenticated: !!user }
}