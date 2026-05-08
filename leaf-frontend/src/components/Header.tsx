// import ThemeSwitch from "./ThemeSwitch";
import React from "react";
import { Link, useNavigate } from 'react-router'
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault()
    await logout()
    navigate("/")
  }
  return (
    <header className="bg-white dark:bg-black shadow-sm dark:border-b dark:border-gray-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          {/* TODO: add page title from env variable here */}
          <h1 className="text-xl dark:text-gray-100">Logos</h1>
        </div>
        <nav className="flex items-center">
          <ul className="flex space-x-2 mr-2">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            {isAuthenticated ?
              <>
                <li>
                  <Link to="/user/profile">{user?.username}</Link>
                </li>
                <li>
                  <a href="" onClick={handleLogout}>Logout</a>
                </li>
              </>
              :
              <li>
                <Link to="/auth/login">Login</Link>
              </li>
            }
          </ul>
        </nav>
      </div>
    </header>
  );
}
