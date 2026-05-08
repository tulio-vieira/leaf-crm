import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import type { Provider } from '../models/Domain'
import { createProvider, getProvider, updateProvider } from '../services/providerService'

interface Props {
  open: boolean
  providerSlug?: string
  onSuccess: (provider: Provider) => void
  onCancel: () => void
}

function ProviderForm({ open, providerSlug, onSuccess, onCancel }: Props) {
  const isEdit = providerSlug !== undefined

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!providerSlug) return
    getProvider(providerSlug).then(res => {
      if (res.data) {
        setName(res.data.name)
        setDescription(res.data.description)
      }
    })
  }, [providerSlug])

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setErrMsg(null)
    setIsSubmitting(true)

    const res = isEdit
      ? await updateProvider(providerSlug, { name, description })
      : await createProvider({ name, slug, description })

    if (res.errMsg) {
      setErrMsg(res.errMsg)
    } else {
      if (!isEdit) {
        setName('')
        setSlug('')
        setDescription('')
      }
      onSuccess(res.data!)
    }
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Editar Clínica' : 'Nova Clínica'}</DialogTitle>
      <DialogContent>
        <Box component="form" id="provider-form" onSubmit={handleSubmit}>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Nome"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              fullWidth
              size="small"
            />
            {!isEdit && (
              <TextField
                label="Slug"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                required
                fullWidth
                size="small"
                helperText="Identificador amigável para URL (ex: minha-clinica)"
              />
            )}
            <TextField
              label="Descrição"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
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
        <Button type="submit" form="provider-form" variant="contained" disabled={isSubmitting}>
          {isEdit ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProviderForm
