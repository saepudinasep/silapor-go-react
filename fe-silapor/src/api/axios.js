import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('silapor_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('silapor_token')
      localStorage.removeItem('silapor_user')
      localStorage.removeItem('silapor_role')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export default api
