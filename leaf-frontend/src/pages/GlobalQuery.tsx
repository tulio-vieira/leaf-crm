import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import InsuranceAuthorizationQueryView from '../components/insurance-authorizations/InsuranceAuthorizationQueryView'
import PatientQueryView from '../components/patients/PatientQueryView'
import TreatmentSessionQueryView from '../components/treatment-session/TreatmentSessionQueryView'
import { Route, Routes, useLocation, useNavigate } from 'react-router';
import { SearchOutlined } from '@mui/icons-material';

function GlobalQuery() {
  const navigate = useNavigate()
  const location = useLocation()
  const pathSegment = location.pathname.split('/').pop()
  const activeTab = pathSegment === 'treatment-sessions' || pathSegment === 'patients'
    ? pathSegment
    : 'insurance-authorizations'

  return (
    <Box>
      <Typography variant="h5" gutterBottom><SearchOutlined sx={{marginBottom: "-0.1em"}} /> Pesquisa Global</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => navigate(`/list/${v}`)} textColor="primary" indicatorColor="primary">
          <Tab label="Autorizações de Convênio" value="insurance-authorizations" />
          <Tab label="Pacientes" value="patients" />
          <Tab label="Agendamentos" value="treatment-sessions" />
        </Tabs>
      </Box>
      <Routes>
        <Route index element={<InsuranceAuthorizationQueryView />} />
        <Route path="patients" element={<PatientQueryView />} />
        <Route path="treatment-sessions" element={<TreatmentSessionQueryView enableCalendar={false} />} />
        <Route path="insurance-authorizations" element={<InsuranceAuthorizationQueryView />} />
      </Routes>
    </Box>
  )
}

export default GlobalQuery
