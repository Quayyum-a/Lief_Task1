'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) {
    return (
      <div className="container">
        <div className="text-center" style={{ marginTop: "50px" }}>
          <p>Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return children
}
