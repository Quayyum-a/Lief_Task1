'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '../lib/contexts/AuthContext'
import Login from '../lib/components/Login'

function HomeContent() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      if (user.role === 'manager') {
        router.push('/manager')
      } else {
        router.push('/dashboard')
      }
    }
  }, [user, router])

  if (user) {
    return <div className="container"><p>Redirecting...</p></div>
  }

  return <Login />
}

export default function Home() {
  return (
    <AuthProvider>
      <div className="app">
        <HomeContent />
      </div>
    </AuthProvider>
  )
}
