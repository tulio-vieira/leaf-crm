import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { Role, UserListItem } from '../models/Domain'
import { listRoles } from '../services/roleService'
import { changeUserPassword, createUser, resendEmailValidation, resendPasswordReset, updateUser } from '../services/userService'

interface Props {
  open: boolean
  editUser?: UserListItem | null
  onSuccess: (user: UserListItem) => void
  onCancel: () => void
}

function UserForm({ open, editUser, onSuccess, onCancel }: Props) {
  const isEdit = editUser != null

  const [name, setName] = useState(editUser?.name ?? '')
  const [email, setEmail] = useState(editUser?.email ?? '')
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(editUser?.isEmailConfirmed ?? false)
  const [roleId, setRoleId] = useState<string>(editUser?.roleId ?? '')
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const [newPassword, setNewPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwResult, setPwResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const [resetLoading, setResetLoading] = useState(false)
  const [resetResult, setResetResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const [emailValLoading, setEmailValLoading] = useState(false)
  const [emailValResult, setEmailValResult] = useState<{ ok: boolean; msg: string } | null>(null)

  useEffect(() => {
    listRoles().then(res => {
      if (res.data) setRoles(res.data)
    })
  }, [])

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setIsLoading(true)
    setErrMsg(null)

    const data = { name, email, isEmailConfirmed, roleId: roleId || null }

    const res = editUser !== null && editUser !== undefined
      ? await updateUser(editUser.id, data)
      : await createUser(data)

    setIsLoading(false)
    if (res.errMsg) {
      setErrMsg(res.errMsg)
    } else {
      onSuccess(res.data!)
    }
  }

  async function handleChangePassword() {
    if (!editUser) return
    setPwLoading(true)
    setPwResult(null)
    const res = await changeUserPassword(editUser?.id, newPassword)
    setPwLoading(false)
    if (res.errMsg) {
      setPwResult({ ok: false, msg: res.errMsg })
    } else {
      setPwResult({ ok: true, msg: 'Senha alterada com sucesso.' })
      setNewPassword('')
    }
  }

  async function handleResendPasswordReset() {
    if (!editUser) return
    setResetLoading(true)
    setResetResult(null)
    const res = await resendPasswordReset(editUser?.id)
    setResetLoading(false)
    setResetResult(res.errMsg
      ? { ok: false, msg: res.errMsg }
      : { ok: true, msg: 'E-mail de redefinição de senha enviado.' }
    )
  }

  async function handleResendEmailValidation() {
    if (!editUser) return
    setEmailValLoading(true)
    setEmailValResult(null)
    const res = await resendEmailValidation(editUser?.id)
    setEmailValLoading(false)
    setEmailValResult(res.errMsg
      ? { ok: false, msg: res.errMsg }
      : { ok: true, msg: 'E-mail de validação enviado.' }
    )
  }

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? `Editar Usuário — ${editUser?.name}` : 'Criar Usuário'}</DialogTitle>
      <DialogContent>
        <Box component="form" id="user-form" onSubmit={handleSubmit}>
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
              label="E-mail"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              fullWidth
              size="small"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isEmailConfirmed}
                  onChange={e => setIsEmailConfirmed(e.target.checked)}
                />
              }
              label="E-mail Confirmado"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Cargo</InputLabel>
              <Select
                label="Cargo"
                value={roleId}
                onChange={e => setRoleId(e.target.value)}
              >
                <MenuItem value="">— Nenhuma —</MenuItem>
                {roles.map(role => (
                  <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {errMsg && <Alert severity="error">{errMsg}</Alert>}
          </Stack>
        </Box>

        {isEdit && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Ações Administrativas
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} sx={{alignItems: "flex-start"}}>
                <TextField
                  label="Nova Senha"
                  type="password"
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setPwResult(null) }}
                  size="small"
                  autoComplete="new-password"
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleChangePassword}
                  disabled={pwLoading || !newPassword}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {pwLoading ? <CircularProgress size={20} /> : 'Alterar Senha'}
                </Button>
              </Stack>
              {pwResult && (
                <Alert severity={pwResult.ok ? 'success' : 'error'}>{pwResult.msg}</Alert>
              )}

              <Button
                variant="outlined"
                onClick={handleResendPasswordReset}
                disabled={resetLoading}
                fullWidth
              >
                {resetLoading ? <CircularProgress size={20} /> : 'Reenviar E-mail de Redefinição de Senha'}
              </Button>
              {resetResult && (
                <Alert severity={resetResult.ok ? 'success' : 'error'}>{resetResult.msg}</Alert>
              )}

              <Button
                variant="outlined"
                onClick={handleResendEmailValidation}
                disabled={emailValLoading || editUser?.isEmailConfirmed}
                fullWidth
              >
                {emailValLoading ? <CircularProgress size={20} /> : 'Reenviar E-mail de Validação'}
              </Button>
              {emailValResult && (
                <Alert severity={emailValResult.ok ? 'success' : 'error'}>{emailValResult.msg}</Alert>
              )}
            </Stack>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={isLoading}>Cancelar</Button>
        <Button type="submit" form="user-form" variant="contained" disabled={isLoading}>
          {isLoading ? <CircularProgress size={20} /> : isEdit ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserForm
