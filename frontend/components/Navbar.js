import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { logout, getUser } from '../services/auth'
import { changePassword } from '../services/api'
import Modal from './Modal'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showChangePw, setShowChangePw] = useState(false)
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    setUser(getUser())
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/products', label: 'Products' },
    { href: '/assessments', label: 'Assessments' },
  ]

  const openChangePw = () => {
    setMenuOpen(false)
    setPwForm({ current_password: '', new_password: '', confirm_password: '' })
    setPwError('')
    setPwSuccess(false)
    setShowChangePw(true)
  }

  const handleChangePw = async (e) => {
    e.preventDefault()
    setPwError('')
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError('New passwords do not match')
      return
    }
    if (pwForm.new_password.length < 8) {
      setPwError('New password must be at least 8 characters')
      return
    }
    setPwSaving(true)
    try {
      await changePassword({
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      })
      setPwSuccess(true)
      setTimeout(() => setShowChangePw(false), 1500)
    } catch (err) {
      setPwError(err.response?.data?.detail || 'Failed to change password')
    } finally {
      setPwSaving(false)
    }
  }

  const isAdmin = user?.role === 'admin'

  return (
    <>
      <nav className="bg-brand-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left — logo + nav links */}
            <div className="flex items-center gap-6">
              <Link href="/assessments" className="font-bold text-lg tracking-tight">
                PAMP
              </Link>
              <div className="hidden sm:flex gap-4 items-center">
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

            {/* Right — search, user menu, sign out */}
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

              {/* User dropdown — all users */}
              {user && (
                <div className="relative hidden sm:block" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((o) => !o)}
                    className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
                  >
                    <span>{user.username}</span>
                    <span className="text-gray-500">({user.role})</span>
                    <svg
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 py-1">
                      {/* Admin-only section */}
                      {isAdmin && (
                        <>
                          <p className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Admin
                          </p>
                          <Link
                            href="/admin/users"
                            onClick={() => setMenuOpen(false)}
                            className={`block px-4 py-2 text-sm transition-colors ${
                              router.pathname === '/admin/users'
                                ? 'bg-brand-50 text-brand-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            Users
                          </Link>
                          <div className="my-1 border-t border-gray-100" />
                        </>
                      )}

                      {/* Profile section — all users */}
                      <p className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Account
                      </p>
                      <button
                        onClick={openChangePw}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Change Password
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button onClick={logout} className="text-gray-300 hover:text-white transition-colors">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Change Password Modal */}
      {showChangePw && (
        <Modal title="Change Password" onClose={() => setShowChangePw(false)}>
          {pwSuccess ? (
            <div className="text-center py-4">
              <p className="text-green-600 font-medium">Password changed successfully!</p>
            </div>
          ) : (
            <form onSubmit={handleChangePw} className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <input
                  className="input"
                  type="password"
                  required
                  autoFocus
                  value={pwForm.current_password}
                  onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
                />
              </div>
              <div>
                <label className="label">New Password</label>
                <input
                  className="input"
                  type="password"
                  required
                  minLength={8}
                  value={pwForm.new_password}
                  onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                />
                <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input
                  className="input"
                  type="password"
                  required
                  value={pwForm.confirm_password}
                  onChange={(e) => setPwForm({ ...pwForm, confirm_password: e.target.value })}
                />
              </div>
              {pwError && <p className="text-red-600 text-sm">{pwError}</p>}
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={pwSaving} className="btn-primary">
                  {pwSaving ? 'Saving…' : 'Update Password'}
                </button>
                <button type="button" onClick={() => setShowChangePw(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </>
  )
}
