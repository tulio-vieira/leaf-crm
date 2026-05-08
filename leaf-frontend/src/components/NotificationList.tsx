import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import type { Notification, PagedResponse } from '../models/Domain'
import { listAllNotifications } from '../services/listService'
import { acknowledgeNotification, deleteNotification } from '../services/notificationsApiService'
import PageSwitcher from './PageSwitcher'

function NotificationList() {
  const [searchParams] = useSearchParams()
  const [pagedData, setPagedData] = useState<PagedResponse<Notification> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setErrMsg(null)
    listAllNotifications(searchParams).then(res => {
      if (res.errMsg) setErrMsg(res.errMsg)
      else setPagedData(res.data!)
      setIsLoading(false)
    })
  }, [searchParams])

  async function handleDelete(id: number) {
    setActionError(null)
    const res = await deleteNotification(id)
    if (res.errMsg) {
      setActionError(res.errMsg)
      return
    }
    setPagedData(prev => prev ? { ...prev, items: prev.items.filter(n => n.id !== id) } : prev)
  }

  async function handleAcknowledge(id: number) {
    setActionError(null)
    const res = await acknowledgeNotification(id)
    if (res.errMsg) {
      setActionError(res.errMsg)
      return
    }
    listAllNotifications(searchParams).then(res => {
      if (res.data) setPagedData(res.data)
    })
  }

  if (isLoading) return <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Box>
  if (errMsg) return <Alert severity="error">{errMsg}</Alert>
  if (!pagedData) return null

  return (
    <Box>
      {actionError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>{actionError}</Alert>}

      {pagedData.items.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          Nenhuma notificação encontrada.
        </Typography>
      )}

      {pagedData.items.map(notification => (
        <Accordion key={notification.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mr: 1 }}>
              <Chip size="small" variant="outlined" />
              {notification.acknowledgedByUserEmail
                ? <Chip label="Confirmada" color="success" size="small" />
                : <Chip label="Não lida" color="warning" size="small" />}
              <Typography variant="body2" color="text.secondary">
                {new Date(notification.createdAt).toLocaleString('pt-BR')}
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              sx={{ mb: 2, '& a': { color: 'primary.main' } }}
              dangerouslySetInnerHTML={{ __html: notification.message }}
            />
            {notification.acknowledgedByUserEmail && (
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display:"block" }}>
                Confirmado por: {notification.acknowledgedByUserEmail}
              </Typography>
            )}
            <Stack direction="row" spacing={1}>
              {!notification.acknowledgedByUserEmail && (
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  onClick={() => handleAcknowledge(notification.id)}
                >
                  Confirmar
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => handleDelete(notification.id)}
              >
                Excluir
              </Button>
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}

      <PageSwitcher hasNextPage={pagedData.hasNextPage} />
    </Box>
  )
}

export default NotificationList
