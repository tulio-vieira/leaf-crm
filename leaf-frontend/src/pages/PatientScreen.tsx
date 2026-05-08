import { useEffect, useState } from 'react'
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import type { Patient } from '../models/Domain'
import InsuranceAuthorizationQueryView from '../components/insurance-authorizations/InsuranceAuthorizationQueryView'
import PatientForm from '../components/patients/PatientForm'
import TreatmentSessionQueryView from '../components/treatment-session/TreatmentSessionQueryView'
import { getPatient } from '../services/patientService'

type Tab = 'treatment-sessions' | 'insurance-authorizations'

function PatientScreen() {
  const { id: patientId, providerSlug } = useParams<{ id: string; providerSlug: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const pathSegment = location.pathname.split('/').pop()
  const activeTab = pathSegment === 'treatment-sessions' ? pathSegment
    : 'insurance-authorizations'

  const [patient, setPatient] = useState<Patient | null>(null)
  const [patientErr, setPatientErr] = useState<string | null>(null)
  const [showEditPatient, setShowEditPatient] = useState(false)

  function loadPatient() {
    if (!patientId || !providerSlug) return
    getPatient(providerSlug, Number(patientId)).then(res => {
      if (res.errMsg) setPatientErr(res.errMsg)
      else setPatient(res.data!)
    })
  }

  useEffect(() => { loadPatient() }, [patientId, providerSlug])

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/providers/${providerSlug}`)} sx={{ mb: 2 }}>
        Voltar aos Pacientes
      </Button>

      {patientErr && <Alert severity="error" sx={{ mb: 2 }}>{patientErr}</Alert>}

      {patient && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 1, alignItems: 'center' }}>
            <Typography variant="h4">{patient.name}</Typography>
            <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => setShowEditPatient(true)}>
              Editar
            </Button>
          </Stack>
          <Typography variant="body1" color="text.secondary">{patient.description}</Typography>
          {showEditPatient && <PatientForm
            providerSlug={providerSlug}
            patient={patient}
            onSuccess={() => { setShowEditPatient(false); loadPatient() }}
            onClose={() => setShowEditPatient(false)}
          />}
        </Box>
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => navigate(`/providers/${providerSlug}/patients/${patientId}/${v}`)} textColor="primary" indicatorColor="primary">
          <Tab label="Autorizações de Convênio" value="insurance-authorizations" />
          <Tab label="Agendamentos" value="treatment-sessions" />
        </Tabs>
      </Box>
      <Routes>
        <Route index element={<InsuranceAuthorizationQueryView
          providerSlug={providerSlug}
          patientId={patientId} />} />
        <Route path="treatment-sessions" element={
          <TreatmentSessionQueryView
            providerSlug={providerSlug}
            patientId={patientId}
            enableCalendar={true}
          />} />
        <Route path="insurance-authorizations" element={
          <InsuranceAuthorizationQueryView
            providerSlug={providerSlug}
            patientId={patientId}
          />
        } />
      </Routes>
    </Box>
  )
}

export default PatientScreen
