import React from "react"
import { Navigate } from "react-router"
import { useAuth } from "../context/AuthContext"

interface WrapperProps {
  Component: React.ComponentType;
}

const PrivateRoute: React.FC<WrapperProps> = ({ Component }) => {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }
  return <Component />
}

export default PrivateRoute
