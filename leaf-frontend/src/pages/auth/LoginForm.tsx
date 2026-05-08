import React, { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useAuth } from '../../context/AuthContext'
import { backendAPI } from '../../services/backendService'
import type { PageState } from '../../models/PageState'
import type { UserResponse } from '../../models/User'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [pageState, setPageState] = useState<PageState<UserResponse>>({})
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    if (pageState.isLoading) return
    setPageState({ isLoading: true })
    const res = await login(email, pwd)
    if (res.errMsg) {
      setPageState(res)
    } else {
      const params = new URLSearchParams(document.location.search)
      navigate(params.get('redirect') || res.data?.homePage || '/')
    }
  }

  const handleEmailValidationRequest = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (pageState.isLoading) return
    setPageState({ isLoading: true })
    const res = await backendAPI.resendEmailValidation(email, pwd)
    setPageState(res)
  }

  if (pageState.data?.message) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <Paper elevation={2} sx={{ p: 4, maxWidth: 420, width: '100%', textAlign: 'center' }}>
          <Typography>{pageState.data.message}</Typography>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <Paper elevation={2} sx={{ p: 4, maxWidth: 420, width: '100%' }}>
        <Typography variant="h5" gutterBottom>Login</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Bem-vindo de volta!
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="E-mail"
              type="text"
              autoComplete="off"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              fullWidth
              size="small"
            />
            <TextField
              label="Senha"
              type="password"
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              placeholder="••••••••"
              required
              fullWidth
              size="small"
            />
            <Box sx={{ textAlign: 'right' }}>
              <Link component={RouterLink} to="/auth/forgot-password" variant="body2">
                Esqueceu a senha?
              </Link>
            </Box>
            <Button type="submit" variant="contained" fullWidth disabled={pageState.isLoading}>
              {pageState.isLoading ? <CircularProgress size={22} color="inherit" /> : 'Login'}
            </Button>
          </Stack>
        </Box>

        {pageState.errMsg && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {pageState.errMsg}
            {pageState.errMsg.includes('não foi validado') && (
              <Box sx={{ mt: 1 }}>
                <Link href="#" onClick={handleEmailValidationRequest} variant="body2">
                  Reenviar E-mail de Validação
                </Link>
              </Box>
            )}
          </Alert>
        )}

        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Não tem uma conta?{' '}
          <Link component={RouterLink} to="/auth/register">Cadastre-se</Link>
        </Typography>
      </Paper>
    </Box>
  )
}
