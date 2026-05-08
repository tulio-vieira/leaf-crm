import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import ProviderForm from '../components/ProviderForm'
import ProviderList from '../components/ProviderList'
import HomeIcon from '@mui/icons-material/Home'

function Home() {
  const [providerRefreshKey, setProviderRefreshKey] = useState(0)
  const [showCreateProvider, setShowCreateProvider] = useState(false)

  return (
    <Box>
      <Typography variant="h5" gutterBottom><HomeIcon sx={{marginBottom: "-0.1em"}} /> Gestão de Clínicas</Typography>

      <Box>
        <ProviderForm
          open={showCreateProvider}
          onSuccess={() => { setShowCreateProvider(false); setProviderRefreshKey(k => k + 1) }}
          onCancel={() => setShowCreateProvider(false)}
        />
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateProvider(true)}
          >
            Nova Clínica
          </Button>
        </Box>
        <ProviderList refreshKey={providerRefreshKey} />
      </Box>
    </Box>
  )
}

export default Home
