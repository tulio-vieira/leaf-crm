import { useEffect } from "react"
import { useNavigate } from "react-router"
import { useAuth } from "../context/AuthContext"

export const isAuth = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login")
    }
  }, [isAuthenticated])
}
