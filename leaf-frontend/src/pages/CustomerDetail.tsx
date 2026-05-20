import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ConfirmDialog from '../components/ConfirmDialog'
import CustomerForm from '../components/Customer/CustomerForm'
import type { Customer } from '../models/Domain'
import type { PageState } from '../models/PageState'
import { getCustomer, deleteCustomer } from '../services/customerService'

function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [customerState, setCustomerState] = useState<PageState<Customer>>({ isLoading: true })
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteState, setDeleteState] = useState<PageState>({})

  async function fetchCustomer() {
    setCustomerState({ isLoading: true })
    const res = await getCustomer(Number(id))
    if (res.errMsg) setCustomerState({ errMsg: res.errMsg })
    else setCustomerState({ data: res.data })
  }

  useEffect(() => { fetchCustomer() }, [id])

  async function handleDelete() {
    setDeleteState({ isLoading: true })
    const res = await deleteCustomer(Number(id))
    if (res.errMsg) {
      setDeleteState({ errMsg: res.errMsg })
    } else {
      navigate('/customers')
    }
  }

  const customer = customerState.data

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Voltar
      </Button>

      {customerState.isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {customerState.errMsg && <Alert severity="error">{customerState.errMsg}</Alert>}

      {customer && (
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{customer.name}</Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setShowEditForm(true)}
              >
                Editar
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setShowDelete(true)}
              >
                Excluir
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Stack spacing={1.5}>
            <Box>
              <Typography variant="caption" color="text.secondary">Empresa</Typography>
              <Typography variant="body1">{customer.company || '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">E-mail</Typography>
              <Typography variant="body1">{customer.email || '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Telefone</Typography>
              <Typography variant="body1">{customer.phoneNumber || '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Endereço</Typography>
              <Typography variant="body1">{customer.address || '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Descrição</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{customer.description || '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Criado em</Typography>
              <Typography variant="body1">{new Date(customer.createdAt).toLocaleString('pt-BR')}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Última modificação</Typography>
              <Typography variant="body1">{new Date(customer.modifiedAt).toLocaleString('pt-BR')}</Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      {showEditForm && customer && (
        <CustomerForm
          customer={customer}
          onSuccess={() => { setShowEditForm(false); fetchCustomer() }}
          onCancel={() => setShowEditForm(false)}
        />
      )}

      <ConfirmDialog
        open={showDelete}
        title="Excluir Cliente"
        message={`Deseja excluir o cliente "${customer?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        onCancel={() => { setShowDelete(false); setDeleteState({}) }}
        isLoading={deleteState.isLoading}
        errMsg={deleteState.errMsg}
      />
    </Box>
  )
}

export default CustomerDetail
