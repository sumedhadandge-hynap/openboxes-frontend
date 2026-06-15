import axios from "axios"
import { useAuthStore } from "@/store/useAuthStore"
import { API_BASE_URL } from "@/config"

// Configure request interceptor to add access token to headers
axios.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Configure response interceptor to handle token refresh on 401
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Avoid infinite loop if the 401 is from login or refresh endpoints
    const isAuthUrl = 
      originalRequest.url?.includes("/auth/login") || 
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/logout")

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthUrl) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axios(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = useAuthStore.getState().refreshToken
      if (!refreshToken) {
        isRefreshing = false
        useAuthStore.getState().logout()
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        })

        if (response.data && response.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data
          
          // Update the auth store with the new tokens
          const currentUser = useAuthStore.getState().user
          if (currentUser) {
            useAuthStore.getState().login(
              currentUser,
              accessToken,
              newRefreshToken || refreshToken
            )
          } else {
            useAuthStore.setState({
              token: accessToken,
              refreshToken: newRefreshToken || refreshToken,
              isAuthenticated: true
            })
            localStorage.setItem("token", accessToken)
            localStorage.setItem("refreshToken", newRefreshToken || refreshToken)
          }

          processQueue(null, accessToken)
          isRefreshing = false

          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return axios(originalRequest)
        } else {
          throw new Error("Token refresh response structure invalid")
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
        isRefreshing = false
        useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
