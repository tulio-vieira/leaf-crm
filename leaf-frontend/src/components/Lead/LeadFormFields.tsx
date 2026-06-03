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
  boardsState: PageState<Board[]>
  formState: PageState
}

function LeadFormFields({ isEdit, currBoard, leadFields, boardsState, formState }: Props) {
  const [customer, setCustomer] = useState<CustomerOption | null>(leadFields.customerId && leadFields.customerName ? {id: leadFields.customerId, name: leadFields.customerName } : null)
  const [description, setDescription] = useState(leadFields.description)
  const [boardId, setBoardId] = useState<number | undefined>(leadFields.boardId)
  const [columnIdx, setColumnIdx] = useState<number | undefined>(leadFields.columnIdx)
  const [assignedToUser, setAssignedToUser] = useState<UserOption | null>(leadFields.assignedToUserGuid && leadFields.assignedToUserName ? { id: leadFields.assignedToUserGuid, name: leadFields.assignedToUserName } : null)

  const selectedBoard = currBoard ?? boardsState.data?.find(b => b.id === boardId) ?? null

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      {boardsState.errMsg && <Alert severity="error">{boardsState.errMsg}</Alert>}
      {formState.errMsg && <Alert severity="error">{formState.errMsg}</Alert>}

      <CustomerDropdown
        value={customer}
        onChange={c => {
          leadFields.customerId = c?.id
          leadFields.customerName = c?.name 
          setCustomer(c)
        }}
        disabled={isEdit || formState.isLoading}
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
        disabled={formState.isLoading}
      />

      <UserDropdown
        value={assignedToUser}
        onChange={u => {
          leadFields.assignedToUserGuid = u?.id
          leadFields.assignedToUserName = u?.name
          setAssignedToUser(u)
        }}
        disabled={formState.isLoading}
      />

      <FormControl fullWidth required disabled={boardsState.isLoading || formState.isLoading || (!isEdit && currBoard !== undefined)}>
        <InputLabel>Quadro</InputLabel>
        <Select
          value={boardId}
          label="Quadro"
          onChange={e => {
            const newBoardId = e.target.value as number
            leadFields.boardId = newBoardId
            setBoardId(newBoardId)
            leadFields.columnIdx = 0
            setColumnIdx(0)
          }}
        >
          {boardsState.data?.map(b => (
            <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth required disabled={!selectedBoard || formState.isLoading}>
        <InputLabel>Coluna</InputLabel>
        <Select
          value={columnIdx}
          label="Coluna"
          onChange={e => {
            const newColumnIdx = e.target.value as number
            leadFields.columnIdx = newColumnIdx
            setColumnIdx(newColumnIdx)
          }}
        >
          {selectedBoard?.columns.map((col, idx) => (
            <MenuItem key={idx} value={idx}>{col.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  )
}

export default LeadFormFields
