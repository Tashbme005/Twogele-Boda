import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GuestOnly, RequireAuth } from './components/AuthGate'
import Layout from './components/Layout'
import { AuthProvider } from './lib/AuthContext'
import { LanguageProvider } from './i18n/LanguageContext'
import Dashboard from './pages/Dashboard'
import Emergency from './pages/Emergency'
import Financial from './pages/Financial'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Settings from './pages/Settings'
import SignUp from './pages/SignUp'
import Wealth from './pages/Wealth'

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <GuestOnly>
                  <Landing />
                </GuestOnly>
              }
            />
            <Route
              path="/login"
              element={
                <GuestOnly>
                  <Login />
                </GuestOnly>
              }
            />
            <Route
              path="/signup"
              element={
                <GuestOnly>
                  <SignUp />
                </GuestOnly>
              }
            />

            <Route
              path="/app"
              element={
                <RequireAuth>
                  <Layout />
                </RequireAuth>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="emergency" element={<Emergency />} />
              <Route path="finance" element={<Financial />} />
              <Route path="wealth" element={<Wealth />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  )
}
