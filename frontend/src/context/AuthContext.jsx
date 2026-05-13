import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ccrts_user')) } catch { return null }
  })

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('ccrts_token', data.access_token)
    localStorage.setItem('ccrts_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ccrts_token')
    localStorage.removeItem('ccrts_user')
    setUser(null)
  }, [])

  const hasRole = useCallback((...roles) => {
    return user && roles.includes(user.role)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
