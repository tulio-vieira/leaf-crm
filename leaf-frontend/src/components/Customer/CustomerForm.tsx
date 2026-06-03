import { useState } from 'react'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import type { Customer } from '../../models/Domain'
import type { PageState } from '../../models/PageState'
import { createCustomer, updateCustomer, type CustomerRequest } from '../../services/customerService'
import CustomerFormFields, { type CustomerFields } from './CustomerFormFields';

interface Props {
  customer?: Customer
  onSuccess: () => void
  onCancel: () => void
}

function CustomerForm({ customer, onSuccess, onCancel }: Props) {
  const isEdit = customer !== undefined
  const [customerFields, _] = useState<CustomerFields>(customer || {})
  const [formState, setFormState] = useState<PageState>({})
  const [validationError, setValidationError] = useState<string | undefined>(undefined)

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (validationError || !customerFields.name) return
    setFormState({ isLoading: true })

    const data: CustomerRequest = {
      name: customerFields.name,
      description: customerFields.description || undefined,
      email: customerFields.email || undefined,
      phoneNumber: customerFields.phoneNumber || undefined,
      address: customerFields.address || undefined,
      company: customerFields.company || undefined,
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
        <CustomerFormFields
          errMsg={formState.errMsg}
          isLoading={formState.isLoading}
          customerFields={customerFields}
          setValidationError={setValidationError}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={formState.isLoading}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={formState.isLoading || validationError !== undefined}
        >
          {formState.isLoading ? <CircularProgress size={20} color="inherit" /> : isEdit ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CustomerForm
