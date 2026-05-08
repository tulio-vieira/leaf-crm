import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import type { InsuranceAuthorization, TreatmentSession } from '../../models/Domain'
import { listAuthorizations } from '../../services/insuranceAuthorizationService'
import { createSession, updateSession } from '../../services/treatmentSessionService'
import CurrencyInput from '../CurrencyInput'
import { toLocalInputValue, toUtcIso } from '../../util/datetime'

interface Props {
  providerSlug?: string
  patientId?: string
  session?: TreatmentSession
  initialStart?: string
  initialEnd?: string
  onSuccess: () => void
  onClose: () => void
}

function TreatmentSessionForm({ providerSlug, patientId, session, initialStart, initialEnd, onSuccess, onClose }: Props) {
  const isEdit = session !== undefined
  const effectiveProviderSlug = providerSlug ?? session?.providerSlug ?? ''
  const effectivePatientId = patientId ?? String(session?.patientId)

  const [name, setName] = useState(session?.name ?? '')
  const [description, setDescription] = useState(session?.description ?? '')
  const [insuranceAuthorizationId, setInsuranceAuthorizationId] = useState(
    session?.insuranceAuthorizationId != null ? String(session.insuranceAuthorizationId) : ''
  )
  const [priceCents, setPriceCents] = useState<number | ''>(session?.priceCents ?? '')
  const [paymentReceived, setPaymentReceived] = useState(session?.paymentReceived ?? false)
  const [start, setStart] = useState(session ? toLocalInputValue(session.start) : (initialStart ? toLocalInputValue(initialStart) : ''))
  const [end, setEnd] = useState(session ? toLocalInputValue(session.end) : (initialEnd ? toLocalInputValue(initialEnd) : ''))

  console.log("start", start)
  console.log("end", end)

  const [availableAuths, setAvailableAuths] = useState<InsuranceAuthorization[]>([])
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!effectiveProviderSlug || !effectivePatientId) return
    listAuthorizations(effectiveProviderSlug, effectivePatientId).then(res => {
      if (!res.data) return
      const nonFull = res.data.items.filter(a => a.remainingSessions > 0)
      if (session?.insuranceAuthorizationId != null) {
        const alreadyIncluded = nonFull.some(a => a.id === session.insuranceAuthorizationId)
        if (!alreadyIncluded) {
          const existing = res.data.items.find(a => a.id === session.insuranceAuthorizationId)
          if (existing) nonFull.push(existing)
        }
      }
      setAvailableAuths(nonFull)
    })
  }, [effectiveProviderSlug, effectivePatientId])

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setErrMsg(null)
    setIsSubmitting(true)

    const data = {
      name,
      description,
      ...(insuranceAuthorizationId !== '' && { insuranceAuthorizationId: parseInt(insuranceAuthorizationId) }),
      ...(priceCents !== '' && { priceCents }),
      paymentReceived,
      start: toUtcIso(start),
      end: toUtcIso(end),
    }

    const res = isEdit
      ? await updateSession(effectiveProviderSlug, effectivePatientId, session.id, data)
      : await createSession(effectiveProviderSlug, effectivePatientId, data)

    if (res.errMsg) {
      setErrMsg(res.errMsg)
    } else {
      onSuccess()
    }
    setIsSubmitting(false)
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
      <DialogContent>
        <Box component="form" id="treatment-session-form" onSubmit={handleSubmit}>
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
              <InputLabel>Autorização de Convênio</InputLabel>
              <Select
                value={insuranceAuthorizationId}
                label="Autorização de Convênio"
                onChange={e => setInsuranceAuthorizationId(e.target.value)}
              >
                <MenuItem value="">Sem Autorização</MenuItem>
                {availableAuths.map(auth => (
                  <MenuItem key={auth.id} value={String(auth.id)}>{auth.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <CurrencyInput
              label="Preço"
              value={priceCents}
              onChange={setPriceCents}
              fullWidth
              size="small"
            />
            <TextField
              label="Início"
              type="datetime-local"
              value={start}
              onChange={e => setStart(e.target.value)}
              required
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Fim"
              type="datetime-local"
              value={end}
              onChange={e => setEnd(e.target.value)}
              required
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={paymentReceived}
                  onChange={e => setPaymentReceived(e.target.checked)}
                  color="primary"
                />
              }
              label="Pagamento Recebido"
            />
            {errMsg && <Alert severity="error">{errMsg}</Alert>}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
        <Button type="submit" form="treatment-session-form" variant="contained" disabled={isSubmitting}>
          {isEdit ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TreatmentSessionForm
