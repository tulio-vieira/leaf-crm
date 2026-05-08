import React, { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { backendAPI } from '../../services/backendService'
import type { PageState } from '../../models/PageState'
import type { UserResponse } from '../../models/User'

export default function RegisterForm() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pageState, setPageState] = useState<PageState<UserResponse>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pageState.isLoading) return
    if (pwd !== confirmPwd) {
      return setPageState({ errMsg: 'As senhas não correspondem' })
    }
    setPageState({ isLoading: true })
    const res = await backendAPI.register(username, email, pwd)
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
        <Typography variant="h5" gutterBottom>Criar conta</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Junte-se ao Logos
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Nome de usuário"
              type="text"
              autoComplete="off"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              fullWidth
              size="small"
            />
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
            <TextField
              label="Confirmar Senha"
              type="password"
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              placeholder="••••••••"
              required
              fullWidth
              size="small"
            />
            <Button type="submit" variant="contained" fullWidth disabled={pageState.isLoading}>
              {pageState.isLoading ? <CircularProgress size={22} color="inherit" /> : 'Cadastrar'}
            </Button>
          </Stack>
        </Box>

        {pageState.errMsg && <Alert severity="error" sx={{ mt: 2 }}>{pageState.errMsg}</Alert>}
      </Paper>
    </Box>
  )
}
