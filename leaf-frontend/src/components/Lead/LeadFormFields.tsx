import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import type { Board, CustomerOption, Lead, UserOption } from '../../models/Domain'
import type { PageState } from '../../models/PageState'
import BoardDropdown from '../BoardDropdown'
import CustomerDropdown from '../CustomerDropdown'
import UserDropdown from '../UserDropdown'

export interface LeadFields {
  customer: CustomerOption | null
  description: string
  boardId?: number
  columnIdx?: number
  assignedToUser: UserOption | null
}

interface Props {
  isEdit: boolean
  currBoard?: Board
  leadFields: Partial<Lead>
  disabled?: boolean
}

function LeadFormFields({ isEdit, currBoard, leadFields, disabled }: Props) {
  const [customer, setCustomer] = useState<CustomerOption | null>(leadFields.customerId && leadFields.customerName ? {id: leadFields.customerId, name: leadFields.customerName } : null)
  const [description, setDescription] = useState(leadFields.description)
  const [board, setBoard] = useState<Board | null>(leadFields.board ?? currBoard ?? null)
  const [columnIdx, setColumnIdx] = useState<number | undefined>(leadFields.columnIdx)
  const [assignedToUser, setAssignedToUser] = useState<UserOption | null>(leadFields.assignedToUserGuid && leadFields.assignedToUserName ? { id: leadFields.assignedToUserGuid, name: leadFields.assignedToUserName } : null)

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <CustomerDropdown
        value={customer}
        onChange={c => {
          leadFields.customerId = c?.id
          leadFields.customerName = c?.name 
          setCustomer(c)
        }}
        disabled={isEdit || disabled}
      />

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
