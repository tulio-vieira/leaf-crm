import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8B5CF6',
      light: '#A78BFA',
      dark: '#7C3AED',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#22D3EE',
      light: '#67E8F9',
      dark: '#06B6D4',
      contrastText: '#0A0A0A',
    },
    background: {
      default: '#16132A',
      paper: '#1F1C35',
    },
    error: { main: '#F87171' },
    text: {
      primary: '#F0EEF8',
      secondary: '#9D95BA',
    },
    divider: 'rgba(139, 92, 246, 0.15)',
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1F1C35',
          borderRight: '1px solid rgba(139, 92, 246, 0.15)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          mx: 1,
          '&.Mui-selected': {
            backgroundColor: 'rgba(139, 92, 246, 0.15)',
            color: '#A78BFA',
            '& .MuiListItemIcon-root': { color: '#A78BFA' },
          },
          '&:hover': {
            backgroundColor: 'rgba(139, 92, 246, 0.08)',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: 'rgba(139, 92, 246, 0.12)',
            fontWeight: 700,
            color: '#A78BFA',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.06)' },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 3 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
  },
})

export default theme
