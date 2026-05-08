import { useEffect, useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import type { InsuranceAuthorization, PagedResponse, TreatmentSession } from '../models/Domain'
import ConfirmDialog from '../components/ConfirmDialog'
import InsuranceAuthorizationForm from '../components/insurance-authorizations/InsuranceAuthorizationForm'
import InsuranceAuthorizationSnapshotsList from '../components/insurance-authorizations/InsuranceAuthorizationSnapshotsList'
import TreatmentSessionList from '../components/treatment-session/TreatmentSessionList'
import { deleteAuthorization, getAuthorization } from '../services/insuranceAuthorizationService'
import { listTreatmentSessions } from '../services/listService'
import { formatBRL } from '../util/currency'
import { renderMarkdownText } from '../util/text'
import { Tooltip } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={2} sx={{ py: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 200, fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body2" component="span">{value}</Typography>
    </Stack>
  )
}

function InsuranceAuthorizationScreen() {
  const { insuranceAuthorizationId, patientId, providerSlug } = useParams<{
    insuranceAuthorizationId: string
    patientId: string
    providerSlug: string
  }>()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const pageNumber = parseInt(searchParams.get('page') ?? '1') || 1

  const isSnapshots = pathname.endsWith('/snapshots')
  const isSessions = pathname.endsWith('/sessions')
  const baseUrl = `/providers/${providerSlug}/patients/${patientId}/insurance-authorizations/${insuranceAuthorizationId}`

  const [authorization, setAuthorization] = useState<InsuranceAuthorization | null>(null)
  const [authErr, setAuthErr] = useState<string | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteErr, setDeleteErr] = useState<string | null>(null)

  const [sessionData, setSessionData] = useState<PagedResponse<TreatmentSession> | null>(null)
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [sessionsErr, setSessionsErr] = useState<string | null>(null)
  const [sessionsRefreshKey, setSessionsRefreshKey] = useState(0)

  function loadAuthorization() {
    if (!insuranceAuthorizationId || !patientId || !providerSlug) return
    getAuthorization(providerSlug, patientId, Number(insuranceAuthorizationId)).then(res => {
      if (res.errMsg) setAuthErr(res.errMsg)
      else setAuthorization(res.data!)
    })
  }

  useEffect(() => { loadAuthorization() }, [insuranceAuthorizationId, patientId, providerSlug])

  useEffect(() => {
    if (!isSessions || !insuranceAuthorizationId || !patientId || !providerSlug) return
    setSessionsLoading(true)
    setSessionsErr(null)
    const params = new URLSearchParams()
    params.set('page', String(pageNumber))
    listTreatmentSessions(providerSlug, patientId, insuranceAuthorizationId, params).then(res => {
      if (res.errMsg) setSessionsErr(res.errMsg)
      else setSessionData(res.data!)
      setSessionsLoading(false)
    })
  }, [isSessions, providerSlug, patientId, insuranceAuthorizationId, pageNumber, sessionsRefreshKey])

  function handleDelete() {
    if (!insuranceAuthorizationId || !patientId || !providerSlug) return
    setDeleteLoading(true)
    setDeleteErr(null)
    deleteAuthorization(providerSlug, Number(patientId), Number(insuranceAuthorizationId)).then(res => {
      setDeleteLoading(false)
      if (res.errMsg) {
        setDeleteErr(res.errMsg)
      } else {
        setShowDeleteDialog(false)
        navigate(-1)
      }
    })
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Voltar
      </Button>

      <Typography variant="h5" gutterBottom>Autorização de Convênio</Typography>

      {authErr && <Alert severity="error" sx={{ mb: 2 }}>{authErr}</Alert>}

      {!authorization && !authErr && <CircularProgress size={24} />}

      {authorization && (
        <>
          {showEditForm && (
            <InsuranceAuthorizationForm
              authorization={authorization}
              onSuccess={() => { setShowEditForm(false); loadAuthorization() }}
              onClose={() => setShowEditForm(false)}
            />
          )}

          <ConfirmDialog
            open={showDeleteDialog}
            title="Excluir Autorização de Convênio"
            message={`Tem certeza que deseja excluir a autorização "${authorization.name}"? Esta ação não pode ser desfeita.`}
            onConfirm={handleDelete}
            onCancel={() => { setShowDeleteDialog(false); setDeleteErr(null) }}
            isLoading={deleteLoading}
            errMsg={deleteErr ?? undefined}
          />

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
                <Typography variant="h6">{authorization.name}</Typography>
                {authorization.remainingSessions === 0 && <Chip label="Completa" color="warning" size="small" />}
                {authorization.paymentReceived && <Chip label="Pago" color="success" size="small" />}
                {authorization.expired && <Tooltip placement="top" title="Expirada">
                  <ReportGmailerrorredIcon color="warning"/>
                </Tooltip>}
                {authorization.aboutToExpire && <Tooltip placement="top" title="Prestes a Expirar">
                  <AccessTimeIcon color="warning"/>
                </Tooltip>}
                {authorization.aboutToBeFull && <Tooltip placement="top" title="Prestes a Ficar Completa">
                  <WarningAmberIcon color="warning" />
                </Tooltip>}
              </Stack>
              <Divider sx={{ mb: 1 }} />
              <DetailRow
                label="Paciente"
                value={
                  <Link component={RouterLink} to={`/providers/${providerSlug}/patients/${patientId}`}>
                    {authorization.patient?.name}
                  </Link>
                }
              />
              <DetailRow
                label="Clínica"
                value={
                  <Link component={RouterLink} to={`/providers/${providerSlug}`}>
                    {providerSlug}
                  </Link>
                }
              />
              <DetailRow label="Convênio" value={authorization.insuranceName} />
              <DetailRow
                label="Sessões"
                value={`${authorization.attachedSessionCount} / ${authorization.authorizedSessionCount}`}
              />
              <DetailRow label="Preço" value={formatBRL(authorization.priceCents)} />
              <DetailRow label="Pagamento Recebido" value={authorization.paymentReceived ? 'Sim' : 'Não'} />
              <DetailRow
                label="Descrição"
                value={
                  <Box component="span" sx={{ whiteSpace: 'pre-wrap' }}>
                    {renderMarkdownText(authorization.description)}
                  </Box>
                }
              />
              <DetailRow label="Expira em" value={new Date(authorization.expiresAt).toLocaleString('pt-BR')} />
              <DetailRow label="Criado em" value={new Date(authorization.createdAt).toLocaleString('pt-BR')} />
              <Divider sx={{ my: 1 }} />
              <DetailRow label="Monitorar expirada" value={authorization.monitorExpired ? 'Sim' : 'Não'} />
              <DetailRow label="Monitorar prestes a expirar" value={authorization.monitorAboutToExpire ? 'Sim' : 'Não'} />
              <DetailRow label="Monitorar prestes a lotar" value={authorization.monitorAboutToBeFull ? 'Sim' : 'Não'} />
            </CardContent>
          </Card>

          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setShowEditForm(true)}>
              Editar
            </Button>
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setShowDeleteDialog(true)}>
              Excluir
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <Button
              variant={isSnapshots ? 'contained' : 'outlined'}
              onClick={() => navigate(isSnapshots ? baseUrl : `${baseUrl}/snapshots`)}
            >
              Histórico de Snapshots
            </Button>
            <Button
              variant={isSessions ? 'contained' : 'outlined'}
              onClick={() => navigate(isSessions ? baseUrl : `${baseUrl}/sessions`)}
            >
              Sessões
            </Button>
          </Stack>
        </>
      )}

      {isSnapshots && insuranceAuthorizationId && patientId && providerSlug && (
        <InsuranceAuthorizationSnapshotsList
          providerSlug={providerSlug}
          patientId={patientId}
          insuranceAuthorizationId={insuranceAuthorizationId}
        />
      )}

      {isSessions && (
        <>
          {sessionsLoading && <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Box>}
          {sessionsErr && <Alert severity="error">{sessionsErr}</Alert>}
          {sessionData && (
            <TreatmentSessionList
              sessions={sessionData.items}
              hasNextPage={sessionData.hasNextPage}
              onUpdateList={() => setSessionsRefreshKey(k => k + 1)}
              showEditButton
            />
          )}
        </>
      )}
    </Box>
  )
}

export default InsuranceAuthorizationScreen
