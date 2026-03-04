import Cookies from 'js-cookie'

export const saveToken = (token) => Cookies.set('pamp_token', token, { expires: 1 })
export const getToken = () => Cookies.get('pamp_token')
export const removeToken = () => Cookies.remove('pamp_token')
export const isAuthenticated = () => !!getToken()

export const saveUser = (user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pamp_user', JSON.stringify(user))
  }
}

export const getUser = () => {
  if (typeof window !== 'undefined') {
    try {
      return JSON.parse(localStorage.getItem('pamp_user'))
    } catch { return null }
  }
  return null
}

export const logout = () => {
  removeToken()
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pamp_user')
    window.location.href = '/login'
  }
}
