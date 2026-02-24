import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

let accessToken: string | null = null
let refreshToken: string | null = null

export function setAuthTokens(access: string, refresh: string) {
  accessToken = access
  refreshToken = refresh
  localStorage.setItem('accessToken', access)
  localStorage.setItem('refreshToken', refresh)
}

export function clearAuthTokens() {
  accessToken = null
  refreshToken = null
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

export function getStoredTokens() {
  const access = localStorage.getItem('accessToken')
  const refresh = localStorage.getItem('refreshToken')
  if (!access || !refresh) return null
  return { accessToken: access, refreshToken: refresh }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

apiClient.interceptors.request.use(config => {
  const token = accessToken ?? localStorage.getItem('accessToken')
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

let isRefreshing = false
let pendingRequests: Array<(token: string | null) => void> = []

async function refreshTokens(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise(resolve => {
      pendingRequests.push(resolve)
    })
  }

  isRefreshing = true
  try {
    const currentRefreshToken = refreshToken ?? localStorage.getItem('refreshToken')
    if (!currentRefreshToken) {
      clearAuthTokens()
      return null
    }

    const response = await axios.post<{ accessToken: string; refreshToken: string }>(
      `${API_BASE_URL}/auth/refresh`,
      {
        refreshToken: currentRefreshToken,
      },
    )

    setAuthTokens(response.data.accessToken, response.data.refreshToken)
    return response.data.accessToken
  } catch {
    clearAuthTokens()
    return null
  } finally {
    isRefreshing = false
    pendingRequests.forEach(cb => cb(accessToken))
    pendingRequests = []
  }
}

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401) {
      originalRequest._retry = true
      const newAccess = await refreshTokens()
      if (newAccess) {
        originalRequest.headers.set('Authorization', `Bearer ${newAccess}`)
        return apiClient(originalRequest)
      }
    }

    return Promise.reject(error)
  },
)

