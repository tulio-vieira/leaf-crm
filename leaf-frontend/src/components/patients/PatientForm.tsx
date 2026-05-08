import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import type { Patient } from '../../models/Domain'
import { createPatient, updatePatient } from '../../services/patientService'

interface Props {
  providerSlug?: string
  patient?: Patient
  onSuccess: () => void
  onClose: () => void
}

function PatientForm({ providerSlug, patient, onSuccess, onClose }: Props) {
  if (!providerSlug && !patient) throw new Error("Either patient or providerSlug must be passed in to PatientForm!")
  const isEdit = patient !== undefined

  const [name, setName] = useState(patient?.name ?? '')
  const [description, setDescription] = useState(patient?.description ?? '')
  const [shift, setShift] = useState(patient?.shift ?? '')
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setErrMsg(null)
    setIsSubmitting(true)

    const data = {
      name,
      description,
      shift: shift || undefined,
    }

    const res = isEdit
      ? await updatePatient(providerSlug || patient.providerSlug, patient.id, data)
      : await createPatient(providerSlug as string, data)

    if (res.errMsg) {
      setErrMsg(res.errMsg)
    } else {
      onSuccess()
    }
    setIsSubmitting(false)
  }

  return (
    <Dialog open maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Editar Paciente' : 'Novo Paciente'}</DialogTitle>
      <DialogContent>
        <Box component="form" id="patient-form" onSubmit={handleSubmit}>
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
            <FormControl fullWidth size="small">
              <InputLabel>Turno</InputLabel>
              <Select
                value={shift}
                label="Turno"
                onChange={e => setShift(e.target.value)}
              >
                <MenuItem value="">Nenhum</MenuItem>
                <MenuItem value="morning">Manhã</MenuItem>
                <MenuItem value="afternoon">Tarde</MenuItem>
                <MenuItem value="night">Noite</MenuItem>
              </Select>
            </FormControl>
            {errMsg && <Alert severity="error">{errMsg}</Alert>}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
        <Button type="submit" form="patient-form" variant="contained" disabled={isSubmitting}>
          {isEdit ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PatientForm
