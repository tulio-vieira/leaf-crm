import { useNavigate } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import HomeIcon from '@mui/icons-material/Home'

function NotFound() {
  const navigate = useNavigate()
  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h2" color="primary" gutterBottom>404</Typography>
      <Typography variant="h5" gutterBottom>Página não encontrada</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        O recurso que você está procurando não foi encontrado.
      </Typography>
      <Button variant="contained" startIcon={<HomeIcon />} onClick={() => navigate('/')}>
        Voltar ao Início
      </Button>
    </Box>
  )
}

export default NotFound
