import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import type { UserListItem } from '../models/Domain'
import type { PageState } from '../models/PageState'
import { getUser } from '../services/userService'

function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [userState, setUserState] = useState<PageState<UserListItem>>({ isLoading: true })

  useEffect(() => {
    if (!id) return
    setUserState({ isLoading: true })
    getUser(id).then(res => {
      if (res.errMsg) setUserState({ errMsg: res.errMsg })
      else setUserState({ data: res.data })
    })
  }, [id])

  const user = userState.data

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Voltar
      </Button>

      {userState.isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {userState.errMsg && <Alert severity="error">{userState.errMsg}</Alert>}

      {user && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>{user.name}</Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="caption" color="text.secondary">E-mail</Typography>
              <Typography variant="body1">{user.email}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">E-mail confirmado</Typography>
              <Typography variant="body1">{user.isEmailConfirmed ? 'Sim' : 'Não'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Cargo</Typography>
              <Typography variant="body1">{user.roleName ?? '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Criado em</Typography>
              <Typography variant="body1">{new Date(user.createdAt).toLocaleString('pt-BR')}</Typography>
            </Box>
          </Stack>
        </Paper>
      )}
    </Box>
  )
}

export default UserDetail
