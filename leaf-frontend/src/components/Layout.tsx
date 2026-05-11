import type { ReactNode } from 'react'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import ContactPageIcon from '@mui/icons-material/ContactPage'
import HomeIcon from '@mui/icons-material/Home'
import NotificationsIcon from '@mui/icons-material/Notifications'
import PolicyIcon from '@mui/icons-material/Policy'
import { SearchOutlined } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import LeafLogo from './LeafLogo'

const DRAWER_WIDTH = 240

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
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()

  function handleLogout(e: React.MouseEvent) {
    e.preventDefault()
    logout()
    navigate('/')
  }

  const visibleNavItems = navItems.filter(item => !item.authOnly || isAuthenticated)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Logo */}
        <Box
          component={RouterLink}
          to="/"
          sx={{
            px: 2.5,
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
            <LeafLogo size={26} color="currentColor" />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              letterSpacing: 0.3,
              background: 'linear-gradient(135deg, #A78BFA 0%, #22D3EE 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Leaf CRM
          </Typography>
        </Box>

        <Divider />

        {/* Nav items */}
        <List sx={{ flex: 1, overflowY: 'auto', px: 1, py: 1 }}>
          {visibleNavItems.map(item => {
            const selected = location.pathname === item.to
            return (
              <ListItem key={item.to} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={RouterLink}
                  to={item.to}
                  selected={selected}
                  sx={{ borderRadius: 1.5 }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: selected ? 'primary.light' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        variant: 'body2',
                        fontWeight: selected ? 600 : 400,
                        color: selected ? 'primary.light' : 'text.primary',
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>

        <Divider />

        {/* User section */}
        <Box sx={{ px: 2, py: 2, flexShrink: 0 }}>
          {isAuthenticated ? (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 500 }}>
                {user?.username}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Button
                  component={RouterLink}
                  to="/user/profile"
                  size="small"
                  fullWidth
                  variant="text"
                  sx={{ justifyContent: 'flex-start', color: 'text.secondary', fontSize: '0.75rem' }}
                >
                  Meu Perfil
                </Button>
                <Button
                  size="small"
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={handleLogout}
                  sx={{ fontSize: '0.75rem' }}
                >
                  Sair
                </Button>
              </Box>
            </>
          ) : (
            <Button
              component={RouterLink}
              to="/auth/login"
              fullWidth
              variant="contained"
              color="primary"
              size="small"
            >
              Login
            </Button>
          )}
        </Box>
      </Drawer>

      {/* Main content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Box component="main" sx={{ flex: 1, py: 4 }}>
          <Container maxWidth="lg">
            {children}
          </Container>
        </Box>

        <Box
          component="footer"
          sx={{
            py: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Leaf CRM. Todos os direitos reservados.
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
