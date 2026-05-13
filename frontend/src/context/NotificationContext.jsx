import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await api.get('/notifications/')
      setNotifications(data)
      setUnreadCount(data.filter((n) => !n.is_read).length)
    } catch { /* ignore */ }
  }, [user])

  useEffect(() => {
    fetchNotifications()
    const id = setInterval(fetchNotifications, 30000)
    return () => clearInterval(id)
  }, [fetchNotifications])

  const markRead = useCallback(async (id) => {
    await api.put(`/notifications/${id}/read`)
    setNotifications((prev) => prev.map((n) => n.notification_id === id ? { ...n, is_read: true } : n))
    setUnreadCount((c) => Math.max(0, c - 1))
  }, [])

  const markAllRead = useCallback(async () => {
    await api.put('/notifications/read-all')
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
