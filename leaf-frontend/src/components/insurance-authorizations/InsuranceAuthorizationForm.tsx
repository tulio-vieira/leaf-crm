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
import Typography from '@mui/material/Typography'
import type { Insurance, InsuranceAuthorization } from '../../models/Domain'
import { createAuthorization, updateAuthorization } from '../../services/insuranceAuthorizationService'
import { listInsurances } from '../../services/insuranceService'
import CurrencyInput from '../CurrencyInput'
import { toLocalInputValue, toUtcIso } from '../../util/datetime'
import { Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

interface Props {
  providerSlug?: string
  patientId?: string
  authorization?: InsuranceAuthorization
  onSuccess: () => void
  onClose: () => void
}

function InsuranceAuthorizationForm({ onSuccess, onClose, providerSlug, patientId, authorization }: Props) {
  if ((!providerSlug && !patientId) && !authorization) throw new Error("Either insuranceAuth or providerSlug + patientId must be passed in to InsuranceAuthorizationForm!")
  const isEdit = authorization !== undefined


  const [name, setName] = useState(authorization?.name ?? '')
  const [insuranceName, setInsuranceName] = useState(authorization?.insuranceName ?? '')
  const [authorizedSessionCount, setAuthorizedSessionCount] = useState(
    authorization ? String(authorization.authorizedSessionCount) : ''
  )
  const [priceCents, setPriceCents] = useState<number | ''>(authorization?.priceCents ?? '')
  const [paymentReceived, setPaymentReceived] = useState(authorization?.paymentReceived ?? false)
  const [description, setDescription] = useState(authorization?.description ?? '')
  const [expiresAt, setExpiresAt] = useState(
    authorization ? toLocalInputValue(authorization.expiresAt) : ''
  )
  const [monitorExpired, setMonitorExpired] = useState(authorization?.monitorExpired ?? true)
  const [monitorAboutToExpire, setMonitorAboutToExpire] = useState(authorization?.monitorAboutToExpire ?? true)
  const [monitorAboutToBeFull, setMonitorAboutToBeFull] = useState(authorization?.monitorAboutToBeFull ?? true)

  const [availableInsurances, setAvailableInsurances] = useState<Insurance[]>([])
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    listInsurances().then(res => {
      if (res.data) setAvailableInsurances(res.data)
    })
  }, [])

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setErrMsg(null)
    setIsSubmitting(true)

    const data = {
      name,
      insuranceName,
      authorizedSessionCount: parseInt(authorizedSessionCount),
      priceCents: priceCents as number,
      paymentReceived,
      description,
      expiresAt: toUtcIso(expiresAt),
      monitorExpired,
      monitorAboutToExpire,
      monitorAboutToBeFull,
    }

    const res = isEdit
      ? await updateAuthorization(authorization.providerSlug, authorization.patientId, authorization.id, data)
      : await createAuthorization(providerSlug as string, patientId as string, data)

    if (res.errMsg) {
      setErrMsg(res.errMsg)
    } else {
      onSuccess()
    }
    setIsSubmitting(false)
  }

  return (
    <>
      <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEdit ? 'Editar Autorização de Convênio' : 'Nova Autorização de Convênio'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" id="insurance-authorization-form" onSubmit={handleSubmit}>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Nome"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                fullWidth
                size="small"
                />
              <FormControl fullWidth size="small" required>
                <InputLabel>Convênio</InputLabel>
                <Select
                  value={insuranceName}
                  label="Convênio"
                  onChange={e => setInsuranceName(e.target.value)}
                >
                  <MenuItem value=""><em>Selecione</em></MenuItem>
                  {availableInsurances.map(ins => (
                    <MenuItem key={ins.id} value={ins.name}>{ins.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Sessões Autorizadas"
                type="number"
                value={authorizedSessionCount}
                onChange={e => setAuthorizedSessionCount(e.target.value)}
                required
                fullWidth
                size="small"
                />
              <CurrencyInput
                label="Valor"
                value={priceCents}
                onChange={setPriceCents}
                required
                fullWidth
                size="small"
                />
              <TextField
                label={
                  <Tooltip placement="top" title="Links markdown são habilitados. Ex: [nome-do-link](URL)">
                    <span>Descrição <InfoIcon sx={{height: "0.6em", mb: "-0.1em"}}/></span>
                  </Tooltip>
                }
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                fullWidth
                size="small"
                multiline
              />
              <TextField
                label="Expira em"
                type="datetime-local"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
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
              <Typography variant="subtitle2" color="text.secondary">Notificações</Typography>
              <FormControlLabel
                control={
                  <Checkbox
                  checked={monitorExpired}
                  onChange={e => setMonitorExpired(e.target.checked)}
                  color="primary"
                  />
                }
                label="Monitorar Expiração"
                />
              <FormControlLabel
                control={
                  <Checkbox
                  checked={monitorAboutToExpire}
                  onChange={e => setMonitorAboutToExpire(e.target.checked)}
                  color="primary"
                  />
                }
                label="Monitorar Prestes a Expirar"
                />
              <FormControlLabel
                control={
                  <Checkbox
                  checked={monitorAboutToBeFull}
                  onChange={e => setMonitorAboutToBeFull(e.target.checked)}
                  color="primary"
                  />
                }
                label="Monitorar Prestes a Ficar Completa"
                />
              {errMsg && <Alert severity="error">{errMsg}</Alert>}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" form="insurance-authorization-form" variant="contained" disabled={isSubmitting}>
            {isEdit ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default InsuranceAuthorizationForm
