import { create } from "zustand"
import axios from "axios"
import { API_BASE_URL } from "@/config"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (user: User, token: string, refreshToken: string) => void
  logout: () => Promise<void>
}

const getInitialUser = (): User | null => {
  const savedUser = localStorage.getItem("user")
  if (!savedUser) return null
  try {
    return JSON.parse(savedUser)
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  token: localStorage.getItem("token") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  login: (user, token, refreshToken) => {
    localStorage.setItem("token", token)
    localStorage.setItem("refreshToken", refreshToken)
    localStorage.setItem("user", JSON.stringify(user))
    set({ user, token, refreshToken, isAuthenticated: true })
  },
  logout: async () => {
    const refreshToken = localStorage.getItem("refreshToken")
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false })

    if (refreshToken) {
      try {
        await axios.post(`${API_BASE_URL}/auth/logout`, { refreshToken })
      } catch (err) {
        console.warn("Failed to notify logout to backend:", err)
      }
    }
  },
}))
