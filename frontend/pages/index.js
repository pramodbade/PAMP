import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { isAuthenticated } from '../services/auth'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    router.replace(isAuthenticated() ? '/assessments' : '/login')
  }, [])
  return null
}
