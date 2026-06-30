import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import AddIcon from '@mui/icons-material/Add'
import { useState } from 'react'
import type { Board, CustomerOption, Lead, UserOption } from '../../models/Domain'
import BoardDropdown from '../BoardDropdown'
import CustomerDropdown from '../CustomerDropdown'
import UserDropdown from '../UserDropdown'
import CustomerFormFields, { type CustomerFields } from '../Customer/CustomerFormFields'
import { Typography } from '@mui/material';

interface Props {
  isEdit: boolean
  currBoard?: Board
  leadFields: Partial<Lead>
  disabled?: boolean
  customerMode: 'existing' | 'new'
  onCustomerModeChange: (mode: 'existing' | 'new') => void
  customerFields: CustomerFields
  onCustomerValidationError: (err?: string) => void
}

function LeadFormFields({ isEdit, currBoard, leadFields, disabled, customerMode, onCustomerModeChange, customerFields, onCustomerValidationError }: Props) {
  const [customer, setCustomer] = useState<CustomerOption | null>(leadFields.customerId && leadFields.customerName ? {id: leadFields.customerId, name: leadFields.customerName } : null)
  const [description, setDescription] = useState(leadFields.description)
  const [board, setBoard] = useState<Board | null>(leadFields.board ?? currBoard ?? null)
  const [columnIdx, setColumnIdx] = useState<number | undefined>(leadFields.columnIdx)
  const [assignedToUser, setAssignedToUser] = useState<UserOption | null>(leadFields.assignedToUserGuid && leadFields.assignedToUserName ? { id: leadFields.assignedToUserGuid, name: leadFields.assignedToUserName } : null)

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      {customerMode === 'existing' ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flexGrow: 1 }}>
            <CustomerDropdown
              value={customer}
              onChange={c => {
                leadFields.customerId = c?.id
                leadFields.customerName = c?.name
                setCustomer(c)
              }}
              disabled={isEdit || disabled}
            />
          </Box>
          {!isEdit && (
            <IconButton onClick={() => onCustomerModeChange('new')} disabled={disabled} title="Criar novo cliente">
              <AddIcon />
            </IconButton>
          )}
        </Box>
      ) : (
        <>
          <Typography></Typography>
          <CustomerFormFields
            customerFields={customerFields}
            setValidationError={onCustomerValidationError}
            isLoading={disabled}
            />
        </>
      )}

      <BoardDropdown
        value={board}
        onChange={b => {
          leadFields.boardId = b?.id
          leadFields.columnIdx = 0
          setColumnIdx(0)
          setBoard(b)
        }}
        disabled={isEdit || disabled || currBoard !== undefined}
      />

      <TextField
        label="Descrição"
        value={description}
        onChange={e => {
          leadFields.description = e.target.value
          setDescription(e.target.value)
        }}
        fullWidth
        multiline
        rows={3}
        disabled={disabled}
      />

      <UserDropdown
        value={assignedToUser}
        onChange={u => {
          leadFields.assignedToUserGuid = u?.id
          leadFields.assignedToUserName = u?.name
          setAssignedToUser(u)
        }}
        disabled={disabled}
      />

      <FormControl fullWidth required disabled={!board || disabled}>
        <InputLabel>Coluna</InputLabel>
        <Select
          value={columnIdx ?? ''}
          label="Coluna"
          onChange={e => {
            const newColumnIdx = e.target.value as number
            leadFields.columnIdx = newColumnIdx
            setColumnIdx(newColumnIdx)
          }}
        >
          {board?.columns.map((col, idx) => (
            <MenuItem key={idx} value={idx}>{col.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  )
}

export default LeadFormFields
