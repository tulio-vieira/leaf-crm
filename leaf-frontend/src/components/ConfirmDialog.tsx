import { Alert } from '@mui/material';
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

interface Props {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
  errMsg?: string
}

function ConfirmDialog({ open, title, message, onConfirm, onCancel, isLoading, errMsg }: Props) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={isLoading}>Cancelar</Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={isLoading || errMsg !== undefined}>
          {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Excluir'}
        </Button>
      </DialogActions>
      {errMsg && <Alert severity="error">{errMsg}</Alert>}
    </Dialog>
  )
}

export default ConfirmDialog
