import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import type { Role } from '../models/Domain'
import { deleteRole, listRoles } from '../services/roleService'

interface Props {
  refreshKey?: number
  onEdit?: (role: Role) => void
  onDeleted?: () => void
  onSelect?: (role: Role) => void
  selectedRoleId?: string
}

function RoleList({ refreshKey, onEdit, onDeleted, onSelect, selectedRoleId }: Props) {
  const [roles, setRoles] = useState<Role[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setErrMsg(null)
    listRoles().then(res => {
      if (res.errMsg) setErrMsg(res.errMsg)
      else setRoles(res.data!)
      setIsLoading(false)
    })
  }, [refreshKey])

  async function handleDelete(id: string) {
    const res = await deleteRole(id)
    if (res.errMsg) {
      setErrMsg(res.errMsg)
    } else {
      setRoles(prev => prev?.filter(r => r.id !== id) ?? null)
      onDeleted?.()
    }
  }

  if (isLoading) return <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Box>
  if (errMsg) return <Alert severity="error">{errMsg}</Alert>
  if (!roles) return null

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Permissões</TableCell>
            <TableCell>Página Inicial</TableCell>
            <TableCell>Alterado Por</TableCell>
            <TableCell>Modificado em</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {roles.length === 0 && (
            <TableRow>
              <TableCell colSpan={6}>
                <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  Nenhum cargo ainda.
                </Typography>
              </TableCell>
            </TableRow>
          )}
          {roles.map(role => (
            <TableRow
              key={role.id}
              onClick={() => onSelect?.(role)}
              selected={role.id === selectedRoleId}
              sx={onSelect ? { cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } } : undefined}
            >
              <TableCell>{role.name}</TableCell>
              <TableCell sx={{ maxWidth: 320 }}>
                <Tooltip title={role.permissions} placement="top">
                  <Typography variant="body2" noWrap>
                    {role.permissions || '—'}
                  </Typography>
                </Tooltip>
              </TableCell>
              <TableCell>{role.homePage || '—'}</TableCell>
              <TableCell>{role.changedBy || '—'}</TableCell>
              <TableCell>{new Date(role.modifiedAt).toLocaleDateString('pt-BR')}</TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={e => { e.stopPropagation(); onEdit?.(role) }}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={e => { e.stopPropagation(); handleDelete(role.id) }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default RoleList
