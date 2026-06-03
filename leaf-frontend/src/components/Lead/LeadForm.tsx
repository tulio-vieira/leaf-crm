import { useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import type { Board, Lead } from '../../models/Domain'
import type { PageState } from '../../models/PageState'
import { generateKeyBetween } from 'fractional-indexing'
import { listAllBoards } from '../../services/boardService'
import { createLead, updateLead } from '../../services/leadService'
import LeadFormFields from './LeadFormFields'

interface Props {
  lead?: Lead
  currBoard?: Board
  columnCursors?: Record<string, string | undefined>
  onSuccess: () => void
  onCancel: () => void
}

function validateLead(leadFields: Partial<Lead>) {
  if (
    !leadFields.customerId ||
    !leadFields.customerName ||
    !leadFields.boardId ||
    !leadFields.assignedToUserGuid ||
    !leadFields.assignedToUserName
  ) return false
  return leadFields as Lead
}

function LeadForm({ lead, currBoard, columnCursors, onSuccess, onCancel }: Props) {
  const isEdit = lead !== undefined

  const [leadFields] = useState<Partial<Lead>>(lead || {})
  const [formState, setFormState] = useState<PageState>({})
  const [boardsState, setBoardsState] = useState<PageState<Board[]>>({ isLoading: true })

  useEffect(() => {
    if (currBoard) {
      return setBoardsState({ data: [currBoard] })
    }
    listAllBoards().then(res => {
      if (res.errMsg) {
        setBoardsState({ errMsg: res.errMsg })
      } else {
        setBoardsState({ data: res.data })
      }
    })
  }, [])

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    const validatedFields = validateLead(leadFields)
    if (!validatedFields) return setFormState({ errMsg: "Campos obrigatórios não preenchidos" })
    setFormState({ isLoading: true })
    if (!isEdit) {
      const highestPos = columnCursors ? columnCursors[validatedFields.columnIdx] : null
      validatedFields.position = generateKeyBetween(highestPos, null)
    }
    const res = isEdit
      ? await updateLead(lead!.id, validatedFields)
      : await createLead(validatedFields)
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
        <LeadFormFields
          isEdit={isEdit}
          currBoard={currBoard}
          leadFields={leadFields}
          boardsState={boardsState}
          formState={formState}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={formState.isLoading}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={formState.isLoading || boardsState.isLoading || formState.errMsg !== undefined || boardsState.errMsg !== undefined}
        >
          {formState.isLoading ? <CircularProgress size={20} color="inherit" /> : isEdit ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default LeadForm
