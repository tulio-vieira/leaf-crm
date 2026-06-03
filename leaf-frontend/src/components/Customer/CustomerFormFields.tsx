import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { formatPhone } from '../../util/phone'
import { useState } from 'react';

export interface CustomerFields {
  name?: string
  description?: string
  email?: string
  phoneNumber?: string
  address?: string
  company?: string
}

interface Props {
  errMsg?: string
  isLoading?: boolean
  customerFields: CustomerFields
  setValidationError: (err?: string) => void
}

function validatePhoneNumber(phoneNumber?: string) {
  if (!phoneNumber) return undefined
  const rawDigits = phoneNumber.replace(/\D/g, '')
  return (rawDigits.length > 0 && rawDigits.length !== 10 && rawDigits.length !== 11) ? 'Telefone inválido. Use o formato: XX XXXXX-XXXX' : undefined
}

function CustomerFormFields({
  errMsg,
  isLoading,
  customerFields,
  setValidationError
}: Props) {

  const [name, setName] = useState(customerFields?.name ?? '')
  const [description, setDescription] = useState(customerFields?.description ?? '')
  const [email, setEmail] = useState(customerFields?.email ?? '')
  const [phoneNumber, setPhoneNumber] = useState(formatPhone(customerFields?.phoneNumber ?? ''))
  const [address, setAddress] = useState(customerFields?.address ?? '')
  const [company, setCompany] = useState(customerFields?.company ?? '')

  const rawDigits = phoneNumber.replace(/\D/g, '')
  const phoneError = (rawDigits.length > 0 && rawDigits.length !== 10 && rawDigits.length !== 11) ? 'Telefone inválido. Use o formato: XX XXXXX-XXXX' : undefined

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      {errMsg && <Alert severity="error">{errMsg}</Alert>}

      <TextField
        label="Nome"
        value={name}
        onChange={e => {
          customerFields.name = e.target.value
          setName(e.target.value)
        }}
        required
        fullWidth
        disabled={isLoading}
      />

      <TextField
        label="Empresa"
        value={company}
        onChange={e => {
          customerFields.company = e.target.value
          setCompany(e.target.value)
        }}
        fullWidth
        disabled={isLoading}
      />

      <TextField
        label="E-mail"
        value={email}
        onChange={e => {
          customerFields.email = e.target.value
          setEmail(e.target.value)
        }}
        fullWidth
        type="email"
        disabled={isLoading}
      />

      <TextField
        label="Telefone"
        value={phoneNumber}
        onChange={e => {
          const formattedPhoneNumber = formatPhone(e.target.value)
          customerFields.phoneNumber = formattedPhoneNumber
          setPhoneNumber(formattedPhoneNumber)
          setValidationError(validatePhoneNumber(formattedPhoneNumber))
        }}
        fullWidth
        disabled={isLoading}
        helperText={phoneError ? 'Telefone inválido. Use o formato: XX XXXXX-XXXX' : undefined}
        slotProps={{ htmlInput: { inputMode: 'numeric' } }}
      />

      <TextField
        label="Endereço"
        value={address}
        onChange={e => {
          customerFields.address = e.target.value
          setAddress(e.target.value)
        }}
        fullWidth
        disabled={isLoading}
      />

      <TextField
        label="Descrição"
        value={description}
        onChange={e => {
          customerFields.description = e.target.value
          setDescription(e.target.value)
        }}
        fullWidth
        multiline
        rows={3}
        disabled={isLoading}
      />
    </Stack>
  )
}

export default CustomerFormFields
