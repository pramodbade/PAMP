import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import Modal from '../../components/Modal'
import { adminGetUsers, adminCreateUser, adminUpdateRole, adminUpdateStatus, adminDeleteUser } from '../../services/api'
import { getUser } from '../../services/auth'

const ROLES = ['viewer', 'pentester', 'lead_pentester', 'admin']

const ROLE_BADGE = {
  admin:          'badge-red',
  lead_pentester: 'badge-orange',
  pentester:      'badge-blue',
  viewer:         'badge-gray',
}

const ROLE_LABEL = {
  admin:          'Admin',
  lead_pentester: 'Lead Pentester',
  pentester:      'Pentester',
  viewer:         'Viewer',
}

const EMPTY_FORM = { username: '', email: '', password: '', role: 'pentester' }

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const u = getUser()
    if (!u || u.role !== 'admin') {
      router.replace('/assessments')
      return
    }
    setCurrentUser(u)
    load()
  }, [])

  const load = () =>
    adminGetUsers().then((r) => setUsers(r.data)).catch(() => router.replace('/assessments'))

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await adminCreateUser(form)
      setShowCreate(false)
      setForm(EMPTY_FORM)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminUpdateRole(userId, newRole)
      load()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update role')
    }
  }

  const handleToggleStatus = async (user) => {
    const action = user.is_active ? 'deactivate' : 'reactivate'
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${user.username}?`)) return
    try {
      await adminUpdateStatus(user.id, !user.is_active)
      load()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status')
    }
  }

  const handleDelete = async (user) => {
    if (!confirm(`Permanently delete user "${user.username}"? This cannot be undone.`)) return
    try {
      await adminDeleteUser(user.id)
      load()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete user')
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage platform users and their roles</p>
        </div>
        <button onClick={() => { setError(''); setShowCreate(true) }} className="btn-primary">
          + New User
        </button>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b bg-gray-50">
              <th className="px-4 py-3 font-medium">Username</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => {
              const isSelf = u.username === currentUser?.username
              return (
                <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${!u.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {u.username}
                    {isSelf && <span className="ml-2 text-xs text-gray-400">(you)</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    {isSelf ? (
                      <span className={ROLE_BADGE[u.role]}>{ROLE_LABEL[u.role]}</span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={u.is_active ? 'badge-green' : 'badge-gray'}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!isSelf && (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className="btn-secondary text-xs"
                        >
                          {u.is_active ? 'Deactivate' : 'Reactivate'}
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          className="btn-danger text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Create User Modal ─────────────────────────────────────────────── */}
      {showCreate && (
        <Modal title="Create New User" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">Username *</label>
              <input
                className="input"
                required
                autoFocus
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Email *</label>
              <input
                className="input"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Password *</label>
              <input
                className="input"
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
            </div>
            <div>
              <label className="label">Role</label>
              <select
                className="input"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                ))}
              </select>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Creating…' : 'Create User'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  )
}
