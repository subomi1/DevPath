import axios from 'axios'

const client = axios.create({
  baseURL: '/api/v1',
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

function redirectToLogin() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      redirectToLogin()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // another request already triggered a refresh — wait for it, then retry
      return new Promise((resolve) => {
        refreshQueue.push((newToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          resolve(client(originalRequest))
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const response = await axios.post('/api/v1/auth/refresh/', { refresh: refreshToken })
      const newAccessToken = response.data.access

      localStorage.setItem('access_token', newAccessToken)
      refreshQueue.forEach((callback) => callback(newAccessToken))
      refreshQueue = []

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return client(originalRequest)
    } catch (refreshError) {
      refreshQueue = []
      redirectToLogin()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default client