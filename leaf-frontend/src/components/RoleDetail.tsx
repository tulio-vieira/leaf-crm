import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import type { PagedResponse, Role, UserListItem } from '../models/Domain'
import { listUsers } from '../services/userService'

interface Props {
  role: Role
}

function RoleDetail({ role }: Props) {
  const [pagedData, setPagedData] = useState<PagedResponse<UserListItem> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setErrMsg(null)
    setPagedData(null)
    listUsers(1, role.id).then(res => {
      if (res.errMsg) setErrMsg(res.errMsg)
      else setPagedData(res.data!)
      setIsLoading(false)
    })
  }, [role.id])

  const permissions = role.permissions ? role.permissions.split(';') : []

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>{role.name}</Typography>
      <Typography variant="body2" color="text.secondary">Permissões</Typography>
      <Box sx={{ mt: 0.5, mb: 2, fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap' }}>
        {permissions.length > 0 ? permissions.join('\n') : '—'}
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="subtitle2" gutterBottom>Usuários com este cargo</Typography>
      {isLoading && <CircularProgress size={20} />}
      {errMsg && <Alert severity="error">{errMsg}</Alert>}
      {pagedData && (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>E-mail Confirmado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedData.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography color="text.secondary" sx={{ py: 1, textAlign: 'center' }}>
                      Nenhum usuário atribuído a este cargo.
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  )
}

export default RoleDetail
