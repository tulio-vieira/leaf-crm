import { Route, Routes } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import Home from './pages/Home'
import NotFound from './pages/404'
import LoginForm from './pages/auth/LoginForm'
import { ForgotPasswordForm } from './pages/auth/ForgotPasswordForm'
import RegisterForm from './pages/auth/RegisterForm'
import ResetPasswordPage from './pages/auth/ResetPassword'
import ValidateEmailPage from './pages/auth/ValidateEmail'
import ProfilePage from './pages/Profile'
import NotificationsScreen from './pages/NotificationsScreen'
import AdminScreen from './pages/AdminScreen'
import Contact from './pages/contact';
import LeadScreen from './pages/LeadScreen'
import LeadDetail from './pages/LeadDetail'
import BoardScreen from './pages/BoardScreen'
import BoardDetail from './pages/BoardDetail'
import UserDetail from './pages/UserDetail'

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<PrivateRoute Component={Home}/>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth/login" element={<LoginForm />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/auth/register" element={<RegisterForm />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/validate-email" element={<ValidateEmailPage />} />
          <Route path="/user/profile" element={<PrivateRoute Component={ProfilePage} />} />
          <Route path="/notifications" element={<PrivateRoute Component={NotificationsScreen} />} />
          <Route path="/admin" element={<PrivateRoute Component={AdminScreen} />} />
          <Route path="/leads" element={<PrivateRoute Component={LeadScreen} />} />
          <Route path="/leads/:id" element={<PrivateRoute Component={LeadDetail} />} />
          <Route path="/users/:id" element={<PrivateRoute Component={UserDetail} />} />
          <Route path="/boards" element={<PrivateRoute Component={BoardScreen} />} />
          <Route path="/boards/:id" element={<PrivateRoute Component={BoardDetail} />} />
          <Route element={<NotFound />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default App
