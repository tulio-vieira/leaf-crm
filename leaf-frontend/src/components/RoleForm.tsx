import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import type { Role } from '../models/Domain'
import { createRole, updateRole } from '../services/roleService'

interface Props {
  open: boolean
  editRole?: Role | null
  onSuccess: (role: Role) => void
  onCancel: () => void
}

function RoleForm({ open, editRole, onSuccess, onCancel }: Props) {
  const isEdit = editRole != null

  const [name, setName] = useState(editRole?.name ?? '')
  const [homePage, setHomePage] = useState(editRole?.homePage ?? '')
  // Show permissions one per line for readability
  const [permissionsText, setPermissionsText] = useState(
    editRole ? editRole.permissions.split(';').join('\n') : ''
  )
  const [isLoading, setIsLoading] = useState(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  useEffect(() => {
    if (editRole) {
      setName(editRole.name)
      setHomePage(editRole.homePage ?? '')
      setPermissionsText(editRole.permissions.split(';').join('\n'))
    } else {
      setName('')
      setHomePage('')
      setPermissionsText('')
    }
  }, [editRole])

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setIsLoading(true)
    setErrMsg(null)

    const permissions = permissionsText
      .split('\n')
      .map(p => p.trim())
      .filter(Boolean)
      .join(';')

    const res = isEdit
      ? await updateRole(editRole!.id, { name, permissions, homePage: homePage || null })
      : await createRole({ name, permissions, homePage: homePage || null })

    setIsLoading(false)
    if (res.errMsg) {
      setErrMsg(res.errMsg)
    } else {
      if (!isEdit) {
        setName('')
        setHomePage('')
        setPermissionsText('')
      }
      onSuccess(res.data!)
    }
  }

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? `Editar Cargo — ${editRole!.name}` : 'Criar Cargo'}</DialogTitle>
      <DialogContent>
        <Box component="form" id="role-form" onSubmit={handleSubmit}>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Nome"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              fullWidth
              size="small"
            />
            <TextField
              label="Página Inicial"
              value={homePage}
              onChange={e => setHomePage(e.target.value)}
              fullWidth
              size="small"
              placeholder="/dashboard"
            />
            <TextField
              label="Permissões"
              multiline
              minRows={4}
              fullWidth
              value={permissionsText}
              onChange={e => setPermissionsText(e.target.value)}
              helperText="Uma permissão por linha, ex: providers{*}.patients:read"
              size="small"
            />
            {errMsg && <Alert severity="error">{errMsg}</Alert>}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={isLoading}>Cancelar</Button>
        <Button type="submit" form="role-form" variant="contained" disabled={isLoading}>
          {isLoading ? <CircularProgress size={20} /> : isEdit ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RoleForm
