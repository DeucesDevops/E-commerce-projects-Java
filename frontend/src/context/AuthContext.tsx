import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '../types'
import * as api from '../services/api'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password)
    const userData: User = {
      id: response.userId,
      name: response.name,
      email: response.email,
      role: response.role,
    }
    setToken(response.token)
    setUser(userData)
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const register = async (name: string, email: string, password: string) => {
    const response = await api.register(name, email, password)
    const userData: User = {
      id: response.userId,
      name: response.name,
      email: response.email,
      role: response.role,
    }
    setToken(response.token)
    setUser(userData)
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
