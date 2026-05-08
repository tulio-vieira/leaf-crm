import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import type { Insurance } from '../models/Domain'
import { createInsurance, updateInsurance } from '../services/insuranceService'

interface Props {
  open: boolean
  insurance?: Insurance
  onSuccess: () => void
  onCancel: () => void
}

function InsuranceForm({ open, insurance, onSuccess, onCancel }: Props) {
  const isEdit = insurance !== undefined

  const [name, setName] = useState(insurance?.name ?? '')
  const [description, setDescription] = useState(insurance?.description ?? '')
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setErrMsg(null)
    setIsSubmitting(true)

    const data = { name, description: description || undefined }
    const res = isEdit
      ? await updateInsurance(insurance.id, data)
      : await createInsurance(data)

    if (res.errMsg) {
      setErrMsg(res.errMsg)
    } else {
      onSuccess()
    }
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Editar Convênio' : 'Novo Convênio'}</DialogTitle>
      <DialogContent>
        <Box component="form" id="insurance-form" onSubmit={handleSubmit}>
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
              label="Descrição"
              value={description}
              onChange={e => setDescription(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={2}
            />
            {errMsg && <Alert severity="error">{errMsg}</Alert>}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
        <Button type="submit" form="insurance-form" variant="contained" disabled={isSubmitting}>
          {isEdit ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default InsuranceForm
