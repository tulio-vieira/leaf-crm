import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import type { Customer } from '../../models/Domain'
import type { PageState } from '../../models/PageState'
import { createCustomer, updateCustomer, type CustomerRequest } from '../../services/customerService'

interface Props {
  customer?: Customer
  onSuccess: () => void
  onCancel: () => void
}

function CustomerForm({ customer, onSuccess, onCancel }: Props) {
  const isEdit = customer !== undefined

  const [name, setName] = useState(customer?.name ?? '')
  const [description, setDescription] = useState(customer?.description ?? '')
  const [email, setEmail] = useState(customer?.email ?? '')
  const [phoneNumber, setPhoneNumber] = useState(customer?.phoneNumber ?? '')
  const [address, setAddress] = useState(customer?.address ?? '')
  const [company, setCompany] = useState(customer?.company ?? '')

  const [formState, setFormState] = useState<PageState>({})

  useEffect(() => {
    if (!customer) return
    setName(customer.name)
    setDescription(customer.description ?? '')
    setEmail(customer.email ?? '')
    setPhoneNumber(customer.phoneNumber ?? '')
    setAddress(customer.address ?? '')
    setCompany(customer.company ?? '')
  }, [customer])

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!name) return
    setFormState({ isLoading: true })

    const data: CustomerRequest = {
      name,
      description: description || undefined,
      email: email || undefined,
      phoneNumber: phoneNumber || undefined,
      address: address || undefined,
      company: company || undefined,
    }
    const res = isEdit ? await updateCustomer(customer!.id, data) : await createCustomer(data)
    if (res.errMsg) {
      setFormState({ errMsg: res.errMsg })
    } else {
      setFormState({})
      onSuccess()
    }
  }

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {formState.errMsg && <Alert severity="error">{formState.errMsg}</Alert>}

          <TextField
            label="Nome"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            fullWidth
            disabled={formState.isLoading}
          />

          <TextField
            label="Empresa"
            value={company}
            onChange={e => setCompany(e.target.value)}
            fullWidth
            disabled={formState.isLoading}
          />

          <TextField
            label="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            type="email"
            disabled={formState.isLoading}
          />

          <TextField
            label="Telefone"
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
            fullWidth
            disabled={formState.isLoading}
          />

          <TextField
            label="Endereço"
            value={address}
            onChange={e => setAddress(e.target.value)}
            fullWidth
            disabled={formState.isLoading}
          />

          <TextField
            label="Descrição"
            value={description}
            onChange={e => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            disabled={formState.isLoading}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={formState.isLoading}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={formState.isLoading || !name}
        >
          {formState.isLoading ? <CircularProgress size={20} color="inherit" /> : isEdit ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CustomerForm
