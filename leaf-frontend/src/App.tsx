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
import ProviderScreen from './pages/ProviderScreen'
import PatientScreen from './pages/PatientScreen'
import TreatmentSessionScreen from './pages/TreatmentSessionScreen'
import InsuranceAuthorizationScreen from './pages/InsuranceAuthorizationScreen'
import ProfilePage from './pages/Profile'
import NotificationsScreen from './pages/NotificationsScreen'
import InsurancesPage from './pages/InsurancesPage'
import AdminScreen from './pages/AdminScreen'
import Contact from './pages/contact';
import GlobalQuery from './pages/GlobalQuery';

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<PrivateRoute Component={Home}/>} />
          <Route path="/providers/:providerSlug/patients/:patientId/treatment-sessions/:treatmentSessionId" element={<PrivateRoute Component={TreatmentSessionScreen}/>} />
          <Route path="/providers/:providerSlug/patients/:patientId/insurance-authorizations/:insuranceAuthorizationId/*" element={<PrivateRoute Component={InsuranceAuthorizationScreen}/>} />
          <Route path="/providers/:providerSlug/patients/:id/*" element={<PrivateRoute Component={PatientScreen}/>} />
          <Route path="/providers/:slug/*" element={<PrivateRoute Component={ProviderScreen}/>} />
          <Route path="/list/*" element={<PrivateRoute Component={GlobalQuery}/>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth/login" element={<LoginForm />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/auth/register" element={<RegisterForm />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/validate-email" element={<ValidateEmailPage />} />
          <Route path="/user/profile" element={<PrivateRoute Component={ProfilePage} />} />
          <Route path="/notifications" element={<PrivateRoute Component={NotificationsScreen} />} />
          <Route path="/insurances" element={<PrivateRoute Component={InsurancesPage} />} />
          <Route path="/admin" element={<PrivateRoute Component={AdminScreen} />} />
          <Route element={<NotFound />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default App
