import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation, Routes, Route } from 'react-router'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import type { Provider } from '../models/Domain'
import InsuranceAuthorizationQueryView from '../components/insurance-authorizations/InsuranceAuthorizationQueryView'
import PatientQueryView from '../components/patients/PatientQueryView'
import ProviderForm from '../components/ProviderForm'
import TreatmentSessionQueryView from '../components/treatment-session/TreatmentSessionQueryView'
import { getProvider } from '../services/providerService'

type Tab = 'patients' | 'treatment-sessions' | 'insurance-authorizations'

function ProviderScreen() {
  const { slug: providerSlug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [provider, setProvider] = useState<Provider | null>(null)
  const [providerErr, setProviderErr] = useState<string | null>(null)
  const [showEditProvider, setShowEditProvider] = useState(false)

  const pathSegment = location.pathname.split('/').pop()
  const activeTab = pathSegment === 'treatment-sessions' || pathSegment === 'patients'
    ? pathSegment
    : 'insurance-authorizations'

  useEffect(() => {
    if (!providerSlug) return
    getProvider(providerSlug).then(res => {
      if (res.errMsg) setProviderErr(res.errMsg)
      else setProvider(res.data!)
    })
  }, [providerSlug])

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        Voltar às Clínicas
      </Button>

      {providerErr && <Alert severity="error" sx={{ mb: 2 }}>{providerErr}</Alert>}

      {provider && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 1, alignItems: 'center' }}>
            <Typography variant="h4">{provider.name}</Typography>
            <Chip label={provider.slug} size="small" color="primary" variant="outlined" />
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setShowEditProvider(true)}
            >
              Editar
            </Button>
          </Stack>
          <Typography variant="body1" color="text.secondary">{provider.description}</Typography>
          <ProviderForm
            open={showEditProvider}
            providerSlug={providerSlug!}
            onSuccess={p => { setProvider(p); setShowEditProvider(false) }}
            onCancel={() => setShowEditProvider(false)}
          />
        </Box>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => navigate(`/providers/${providerSlug}/${v}`)} textColor="primary" indicatorColor="primary">
          <Tab label="Autorizações de Convênio" value="insurance-authorizations" />
          <Tab label="Pacientes" value="patients" />
          <Tab label="Agendamentos" value="treatment-sessions" />
        </Tabs>
      </Box>

      <Routes>
        <Route index element={<InsuranceAuthorizationQueryView providerSlug={providerSlug} />} />
        <Route path="patients" element={<PatientQueryView providerSlug={providerSlug} />} />
        <Route path="treatment-sessions" element={<TreatmentSessionQueryView providerSlug={providerSlug} enableCalendar={false} />} />
        <Route path="insurance-authorizations" element={<InsuranceAuthorizationQueryView providerSlug={providerSlug} />} />
      </Routes>
    </Box>
  )
}

export default ProviderScreen
