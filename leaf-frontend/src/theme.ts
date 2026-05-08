import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: { main: '#1565C0' },
    secondary: { main: '#00897B' },
    background: { default: '#F5F8FF', paper: '#ffffff' },
    error: { main: '#C62828' },
  },
  shape: { borderRadius: 6 },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
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
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#E3F2FD',
            fontWeight: 700,
            color: '#1565C0',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: '#F5F8FF' },
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
