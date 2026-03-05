import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
})

// Inject JWT token on every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('pamp_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('pamp_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────
export const login = (username, password) =>
  api.post('/auth/login', { username, password })

export const getMe = () => api.get('/auth/me')
export const changePassword = (data) => api.post('/auth/change-password', data)

// ── Products ──────────────────────────────────────────────────────────────
export const getProducts = () => api.get('/products')
export const getProduct = (id) => api.get(`/products/${id}`)
export const createProduct = (data) => api.post('/products', data)
export const updateProduct = (id, data) => api.put(`/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`/products/${id}`)

// ── Assessments ───────────────────────────────────────────────────────────
export const getAssessments = () => api.get('/assessments')
export const getAssessment = (id) => api.get(`/assessments/${id}`)
export const createAssessment = (data) => api.post('/assessments', data)
export const updateAssessment = (id, data) => api.put(`/assessments/${id}`, data)
export const deleteAssessment = (id) => api.delete(`/assessments/${id}`)

// ── Scope ─────────────────────────────────────────────────────────────────
export const getScope = (assessmentId) => api.get(`/assessments/${assessmentId}/scope`)
export const addScope = (assessmentId, data) => api.post(`/assessments/${assessmentId}/scope`, data)
export const updateScope = (assessmentId, id, data) => api.put(`/assessments/${assessmentId}/scope/${id}`, data)
export const deleteScope = (assessmentId, id) => api.delete(`/assessments/${assessmentId}/scope/${id}`)

// ── Endpoints ─────────────────────────────────────────────────────────────
export const getEndpoints = (assessmentId) => api.get(`/assessments/${assessmentId}/endpoints`)
export const createEndpoint = (assessmentId, data) => api.post(`/assessments/${assessmentId}/endpoints`, data)
export const updateEndpoint = (assessmentId, id, data) => api.put(`/assessments/${assessmentId}/endpoints/${id}`, data)
export const deleteEndpoint = (assessmentId, id) => api.delete(`/assessments/${assessmentId}/endpoints/${id}`)

// ── Checklist ─────────────────────────────────────────────────────────────
export const getChecklist = (assessmentId) => api.get(`/assessments/${assessmentId}/checklist`)
export const updateChecklistItem = (assessmentId, execId, data) =>
  api.patch(`/assessments/${assessmentId}/checklist/${execId}`, data)

// ── Findings ──────────────────────────────────────────────────────────────
export const getFindings = (productId) => api.get(`/products/${productId}/findings`)
export const createFinding = (productId, data) => api.post(`/products/${productId}/findings`, data)
export const updateFinding = (findingId, data) => api.put(`/findings/${findingId}`, data)
export const deleteFinding = (findingId) => api.delete(`/findings/${findingId}`)

export const getVerifications = (assessmentId) => api.get(`/assessments/${assessmentId}/verifications`)
export const createVerification = (assessmentId, data) => api.post(`/assessments/${assessmentId}/verifications`, data)
export const updateVerification = (assessmentId, id, data) =>
  api.patch(`/assessments/${assessmentId}/verifications/${id}`, data)

// ── Blockers ──────────────────────────────────────────────────────────────
export const getBlockers = (assessmentId) => api.get(`/assessments/${assessmentId}/blockers`)
export const createBlocker = (assessmentId, data) => api.post(`/assessments/${assessmentId}/blockers`, data)
export const updateBlocker = (assessmentId, id, data) => api.put(`/assessments/${assessmentId}/blockers/${id}`, data)
export const deleteBlocker = (assessmentId, id) => api.delete(`/assessments/${assessmentId}/blockers/${id}`)

// ── Custom Tests ──────────────────────────────────────────────────────────
export const getCustomTests = (assessmentId) => api.get(`/assessments/${assessmentId}/custom-tests`)
export const createCustomTest = (assessmentId, data) => api.post(`/assessments/${assessmentId}/custom-tests`, data)
export const updateCustomTest = (assessmentId, id, data) => api.put(`/assessments/${assessmentId}/custom-tests/${id}`, data)
export const deleteCustomTest = (assessmentId, id) => api.delete(`/assessments/${assessmentId}/custom-tests/${id}`)

// ── Summary ───────────────────────────────────────────────────────────────
export const getSummary = (assessmentId) => api.get(`/assessments/${assessmentId}/summary`)
export const createSummary = (assessmentId, data) => api.post(`/assessments/${assessmentId}/summary`, data)
export const updateSummary = (assessmentId, data) => api.put(`/assessments/${assessmentId}/summary`, data)

// ── Dashboard ─────────────────────────────────────────────────────────────
export const getDashboardMetrics = () => api.get('/dashboard/metrics')
export const getDashboardCoverage = () => api.get('/dashboard/coverage')
export const getDashboardHeatmap = () => api.get('/dashboard/heatmap')
export const globalSearch = (q) => api.get('/dashboard/search', { params: { q } })

// ── Product Timeline ───────────────────────────────────────────────────────
export const getProductTimeline = (productId) => api.get(`/dashboard/products/${productId}/timeline`)

// ── Admin — User Management ───────────────────────────────────────────────
export const adminGetUsers = () => api.get('/admin/users')
export const adminCreateUser = (data) => api.post('/admin/users', data)
export const adminUpdateRole = (userId, role) => api.put(`/admin/users/${userId}/role`, { role })
export const adminUpdateStatus = (userId, is_active) => api.put(`/admin/users/${userId}/status`, { is_active })
export const adminDeleteUser = (userId) => api.delete(`/admin/users/${userId}`)

export default api
