import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { logout, getUser } from '../services/auth'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  // Read localStorage only on client, after mount
  useEffect(() => {
    setUser(getUser())
  }, [])

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/products', label: 'Products' },
    { href: '/assessments', label: 'Assessments' },
  ]

  return (
    <nav className="bg-brand-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/assessments" className="font-bold text-lg tracking-tight">
              PAMP
            </Link>
            <div className="hidden sm:flex gap-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-sm px-3 py-1 rounded transition-colors ${
                    router.pathname.startsWith(l.href)
                      ? 'bg-brand-600 text-white'
                      : 'text-gray-200 hover:text-white hover:bg-brand-700'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/search"
              title="Search"
              className={`text-gray-300 hover:text-white transition-colors ${router.pathname === '/search' ? 'text-white' : ''}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </Link>
            {user && (
              <span className="text-gray-300 hidden sm:block">
                {user.username} <span className="text-gray-500">({user.role})</span>
              </span>
            )}
            <button onClick={logout} className="text-gray-300 hover:text-white transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
