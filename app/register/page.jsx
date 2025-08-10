'use client'

import { AuthProvider } from '../../lib/contexts/AuthContext'
import Register from '../../lib/components/Register'

export default function RegisterPage() {
  return (
    <AuthProvider>
      <div className="app">
        <Register />
      </div>
    </AuthProvider>
  )
}
