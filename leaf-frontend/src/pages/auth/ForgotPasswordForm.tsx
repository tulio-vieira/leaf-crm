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

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [pageState, setPageState] = useState<PageState<string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pageState.isLoading) return
    setPageState({ isLoading: true })
    const res = await backendAPI.forgotPassword(email)
    setPageState({ errMsg: res.errMsg, data: res.data?.message })
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <Paper elevation={2} sx={{ p: 4, maxWidth: 420, width: '100%' }}>
        <Typography variant="h5" gutterBottom>Esqueci a senha</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Digite seu e-mail e enviaremos um link de redefinição.
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
            <Button type="submit" variant="contained" fullWidth disabled={pageState.isLoading}>
              {pageState.isLoading ? <CircularProgress size={22} color="inherit" /> : 'Enviar Link de Redefinição'}
            </Button>
          </Stack>
        </Box>

        {pageState.errMsg && <Alert severity="error" sx={{ mt: 2 }}>{pageState.errMsg}</Alert>}
        {pageState.data && <Alert severity="success" sx={{ mt: 2 }}>{pageState.data}</Alert>}
      </Paper>
    </Box>
  )
}
