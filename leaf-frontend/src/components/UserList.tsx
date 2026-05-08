import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import type { PagedResponse, UserListItem } from '../models/Domain'
import { deleteUser, listUsers } from '../services/userService'

interface Props {
  refreshKey?: number
  onEdit?: (user: UserListItem) => void
  onDeleted?: () => void
}

function UserList({ refreshKey, onEdit, onDeleted }: Props) {
  const [pagedData, setPagedData] = useState<PagedResponse<UserListItem> | null>(null)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  useEffect(() => { setPage(1) }, [refreshKey])

  useEffect(() => {
    setIsLoading(true)
    setErrMsg(null)
    listUsers(page).then(res => {
      if (res.errMsg) setErrMsg(res.errMsg)
      else setPagedData(res.data!)
      setIsLoading(false)
    })
  }, [page, refreshKey])

  async function handleDelete(id: string) {
    const res = await deleteUser(id)
    if (res.errMsg) {
      setErrMsg(res.errMsg)
    } else {
      setPagedData(prev => prev
        ? { ...prev, items: prev.items.filter(u => u.id !== id) }
        : null
      )
      onDeleted?.()
    }
  }

  if (isLoading) return <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Box>
  if (errMsg) return <Alert severity="error">{errMsg}</Alert>
  if (!pagedData) return null

  return (
    <Box>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>E-mail</TableCell>
              <TableCell>E-mail Confirmado</TableCell>
              <TableCell>Cargo</TableCell>
              <TableCell>Criado em</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedData.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    Nenhum usuário ainda.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {pagedData.items.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.isEmailConfirmed ? 'Sim' : 'Não'}
                    color={user.isEmailConfirmed ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.roleId !== null ? user.roleName : 'Nenhuma'}
                    color={user.roleId !== null ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => onEdit?.(user)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(user.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: 'center' }}>
        <Button size="small" variant="outlined" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
          Anterior
        </Button>
        <Typography variant="body2">Página {pagedData.page}</Typography>
        <Button size="small" variant="outlined" disabled={!pagedData.hasNextPage} onClick={() => setPage(p => p + 1)}>
          Próxima
        </Button>
      </Stack>
    </Box>
  )
}

export default UserList
