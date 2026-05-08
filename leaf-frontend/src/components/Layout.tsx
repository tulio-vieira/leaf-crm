import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import ContactPageIcon from '@mui/icons-material/ContactPage'
import HomeIcon from '@mui/icons-material/Home'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsIcon from '@mui/icons-material/Notifications'
import PolicyIcon from '@mui/icons-material/Policy'
import { useAuth } from '../context/AuthContext'
import { SearchOutlined } from '@mui/icons-material';

interface Props {
  children: ReactNode
}

interface NavItem {
  label: string
  to: string
  icon: ReactNode
  authOnly?: boolean
}

const navItems: NavItem[] = [
  { label: 'Gestão de Clínicas', to: '/', icon: <HomeIcon /> },
  { label: 'Pesquisa Global', to: '/list', icon: <SearchOutlined /> },
  { label: 'Contato', to: '/contact', icon: <ContactPageIcon /> },
  { label: 'Notificações', to: '/notifications', icon: <NotificationsIcon /> },
  { label: 'Convênios', to: '/insurances', icon: <PolicyIcon /> },
  { label: 'Usuários e Cargos', to: '/admin', icon: <AdminPanelSettingsIcon />, authOnly: true },
]

export default function Layout({ children }: Props) {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)

  function handleLogout(e: React.MouseEvent) {
    e.preventDefault()
    logout()
    navigate('/')
  }

  const visibleNavItems = navItems.filter(item => !item.authOnly || isAuthenticated)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={2}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 1 }}
            aria-label="Abrir menu"
          >
            <MenuIcon />
          </IconButton>

          <LocalHospitalIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none', fontWeight: 700, letterSpacing: 0.5 }}
          >
            Logos
          </Typography>

          {isAuthenticated ? (
            <>
              <Button color="inherit" component={RouterLink} to="/user/profile">
                {user?.username}
              </Button>
              <Button color="inherit" onClick={handleLogout}>Sair</Button>
            </>
          ) : (
            <Button color="inherit" component={RouterLink} to="/auth/login">Login</Button>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalHospitalIcon color="primary" />
            <Typography variant="h6" sx={{fontWeight: 700}}>Logos</Typography>
          </Box>
          <Divider />
          <List>
            {visibleNavItems.map(item => (
              <ListItem key={item.to} disablePadding>
                <ListItemButton component={RouterLink} to={item.to}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flex: 1, py: 4, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          py: 2,
          backgroundColor: 'primary.dark',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} Logos. Todos os direitos reservados.
        </Typography>
      </Box>
    </Box>
  )
}
