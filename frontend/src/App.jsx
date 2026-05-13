import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { ToastProvider } from './components/common/Toast'
import Layout from './components/layout/Layout'

import Login         from './pages/Login'
import Register      from './pages/Register'
import Dashboard     from './pages/Dashboard'
import ComplaintList from './pages/ComplaintList'
import ComplaintDetail from './pages/ComplaintDetail'
import ComplaintForm from './pages/ComplaintForm'
import UserList      from './pages/UserList'
import FeedbackList  from './pages/FeedbackList'
import Reports       from './pages/Reports'

function PrivateRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login"    element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      <Route path="/dashboard" element={
        <PrivateRoute>
          <Layout><Dashboard /></Layout>
        </PrivateRoute>
      } />
      <Route path="/complaints" element={
        <PrivateRoute>
          <Layout><ComplaintList /></Layout>
        </PrivateRoute>
      } />
      <Route path="/complaints/new" element={
        <PrivateRoute>
          <Layout><ComplaintForm /></Layout>
        </PrivateRoute>
      } />
      <Route path="/complaints/:id" element={
        <PrivateRoute>
          <Layout><ComplaintDetail /></Layout>
        </PrivateRoute>
      } />
      <Route path="/users" element={
        <PrivateRoute roles={['Admin']}>
          <Layout><UserList /></Layout>
        </PrivateRoute>
      } />
      <Route path="/feedback" element={
        <PrivateRoute roles={['Admin', 'Supervisor', 'QualityTeam']}>
          <Layout><FeedbackList /></Layout>
        </PrivateRoute>
      } />
      <Route path="/reports" element={
        <PrivateRoute roles={['Admin', 'Supervisor', 'QualityTeam']}>
          <Layout><Reports /></Layout>
        </PrivateRoute>
      } />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
