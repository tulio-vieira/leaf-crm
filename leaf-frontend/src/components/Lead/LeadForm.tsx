import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import type { Board, Lead, UserOption } from '../../models/Domain'
import type { PageState } from '../../models/PageState'
import { generateKeyBetween } from 'fractional-indexing'
import { listAllBoards } from '../../services/boardService'
import { createLead, updateLead } from '../../services/leadService'
import UserDropdown from '../UserDropdown'

interface Props {
  lead?: Lead
  currBoard?: Board
  columnCursors: Record<number, string | undefined>
  onSuccess: () => void
  onCancel: () => void
}

function LeadForm({ lead, currBoard, columnCursors, onSuccess, onCancel }: Props) {
  const isEdit = lead !== undefined

  const [name, setName] = useState(lead?.name ?? '')
  const [description, setDescription] = useState(lead?.description ?? '')
  const [boardId, setBoardId] = useState<number | ''>(lead?.boardId ?? currBoard?.id ?? '')
  const [columnIdx, setColumnIdx] = useState<number | ''>(lead?.columnIdx ?? '')
  const [assignedToUser, setAssignedToUser] = useState<UserOption | null>(
    lead?.assignedToUserGuid && lead?.assignedToUserName
      ? { id: lead.assignedToUserGuid, name: lead.assignedToUserName }
      : null
  )

  const [formState, setFormState] = useState<PageState>({})
  const [boardsState, setBoardsState] = useState<PageState<Board[]>>({ isLoading: true })

  useEffect(() => {
    if (currBoard) {
      return setBoardsState({data: [currBoard]})
    }
    listAllBoards().then(res => {
      if (res.errMsg) {
        setBoardsState({ errMsg: res.errMsg })
      } else {
        setBoardsState({ data: res.data })
      }
    })
  }, [])

  useEffect(() => {
    if (!lead) return
    setName(lead?.name ?? '')
    setDescription(lead?.description ?? '')
    setBoardId(lead?.boardId ?? '')
    setColumnIdx(lead?.columnIdx ?? '')
    setAssignedToUser(
      lead?.assignedToUserGuid && lead?.assignedToUserName
        ? { id: lead.assignedToUserGuid, name: lead.assignedToUserName }
        : null
    )
  }, [lead])

  const selectedBoard = currBoard ? currBoard : boardsState.data?.find(b => b.id === boardId) ?? null

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (boardId === '' || columnIdx === '') return
    setFormState({ isLoading: true })

    let position: string | undefined = lead?.position
    if (!isEdit) {
      const highestPos = columnCursors[columnIdx]
      position = generateKeyBetween(highestPos, null)
    }

    const data = { name, description, boardId: boardId as number, columnIdx: columnIdx as number, position, assignedToUserGuid: assignedToUser?.id ?? null }
    const res = isEdit ? await updateLead(lead!.id, data) : await createLead(data)
    if (res.errMsg) {
      setFormState({ errMsg: res.errMsg })
    } else {
      setFormState({})
      onSuccess()
    }
  }

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar Lead' : 'Novo Lead'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {boardsState.errMsg && <Alert severity="error">{boardsState.errMsg}</Alert>}
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
            label="Descrição"
            value={description}
            onChange={e => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            disabled={formState.isLoading}
          />

          <UserDropdown
            value={assignedToUser}
            onChange={setAssignedToUser}
            disabled={formState.isLoading}
          />

          <FormControl fullWidth required disabled={boardsState.isLoading || formState.isLoading || (!isEdit && currBoard !== undefined)}>
            <InputLabel>Quadro</InputLabel>
            <Select
              value={boardId}
              label="Quadro"
              onChange={e => {
                setBoardId(e.target.value as number)
                setColumnIdx('')
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
              onChange={e => setColumnIdx(e.target.value as number)}
            >
              {selectedBoard?.columns.map((col, idx) => (
                <MenuItem key={idx} value={idx}>{col.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={formState.isLoading}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={formState.isLoading || boardsState.isLoading || !name || boardId === undefined || columnIdx === undefined}
        >
          {formState.isLoading ? <CircularProgress size={20} color="inherit" /> : isEdit ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default LeadForm
