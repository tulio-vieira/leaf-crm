import { createContext, useContext, useEffect, useState } from "react"
import { backendAPI } from "../services/backendService"
import type { APIResponse } from "../services/backendService"
import type { AuthResponse } from "../models/User"
import { useNavigate } from 'react-router'


interface CurrentUser {
  username: string
  email: string
}

interface AuthContextType {
  user: CurrentUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<APIResponse<AuthResponse>>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

function populateLocalStorage({username, refreshToken, email}: AuthResponse) {
  localStorage.setItem("refreshToken", refreshToken)
  localStorage.setItem("email", email)
  localStorage.setItem("username", username)
}

function clearLocalStorage() {
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("email")
  localStorage.removeItem("username")
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const [user, setUser] = useState<CurrentUser | null>(() => {
    const email = localStorage.getItem("email")
    const username = localStorage.getItem("username")
    const refreshToken = localStorage.getItem("refreshToken")
    backendAPI.setRefreshData(email, refreshToken)
    backendAPI.onAuthCleared = () => {
      clearLocalStorage()
      navigate("/auth/login")
    }
    if (email && username) return {email, username}
    return null
  })

  useEffect(() => {
    backendAPI.onTokenRefreshed = (data: AuthResponse) => {
      populateLocalStorage(data)
      setUser(data)
    }
    backendAPI.onAuthCleared = () => {
      clearLocalStorage()
      setUser(null)
      navigate("/auth/login")
    }
  }, [])

  const login = async (email: string, password: string): Promise<APIResponse<AuthResponse>> => {
    return backendAPI.login(email, password)
  }

  const logout = async () => {
    try {
      await backendAPI.logout()
    } finally {
      clearLocalStorage()
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: (user !== null) }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
