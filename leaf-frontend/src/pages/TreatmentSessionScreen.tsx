import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import type { TreatmentSession } from '../models/Domain'
import TreatmentSessionForm from '../components/treatment-session/TreatmentSessionForm'
import { getSession } from '../services/treatmentSessionService'
import { formatBRL } from '../util/currency'

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={2} sx={{ py: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 200, fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  )
}

function TreatmentSessionScreen() {
  const { treatmentSessionId, patientId, providerSlug } = useParams<{
    treatmentSessionId: string
    patientId: string
    providerSlug: string
  }>()
  const navigate = useNavigate()

  const [session, setSession] = useState<TreatmentSession | null>(null)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)

  function loadSession() {
    if (!treatmentSessionId || !patientId || !providerSlug) return
    getSession(providerSlug, patientId, Number(treatmentSessionId)).then(res => {
      if (res.errMsg) setErrMsg(res.errMsg)
      else setSession(res.data!)
    })
  }

  useEffect(() => { loadSession() }, [treatmentSessionId, patientId, providerSlug])

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Typography variant="h5" gutterBottom>Agendamento</Typography>

      {errMsg && <Alert severity="error" sx={{ mb: 2 }}>{errMsg}</Alert>}

      {session && (
        <>
          {showEditForm ? (
            <TreatmentSessionForm
              session={session}
              onSuccess={() => { setShowEditForm(false); loadSession() }}
              onClose={() => setShowEditForm(false)}
            />
          ) : (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
                  <Typography variant="h6">{session.name}</Typography>
                  {session.paymentReceived && <Chip label="Pago" color="success" size="small" />}
                  {session.insuranceAuthorizationId != null && (
                    <Chip label="Convênio" color="secondary" size="small" />
                  )}
                </Stack>
                <Divider sx={{ mb: 1 }} />
                <DetailRow label="Descrição" value={session.description || ""} />
                <DetailRow label="Início" value={new Date(session.start).toLocaleString('pt-BR')} />
                <DetailRow label="Fim" value={new Date(session.end).toLocaleString('pt-BR')} />
                {session.priceCents != null && (
                  <DetailRow label="Preço" value={formatBRL(session.priceCents)} />
                )}
                {session.insuranceAuthorizationId != null && (
                  <DetailRow label="Autorização de Convênio" value={<Link to={`/providers/${session.providerSlug}/patients/${session.patientId}/insurance-authorizations/${session.insuranceAuthorizationId}`}>{session.insuranceAuthorization?.name}</Link>} />
                )}
                <DetailRow label="Pagamento Recebido" value={session.paymentReceived ? 'Sim' : 'Não'} />
                <DetailRow label="Criado em" value={new Date(session.createdAt).toLocaleString('pt-BR')} />
              </CardContent>
            </Card>
          )}

          {!showEditForm && (
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setShowEditForm(true)}>
              Editar Agendamento
            </Button>
          )}
        </>
      )}
    </Box>
  )
}

export default TreatmentSessionScreen
