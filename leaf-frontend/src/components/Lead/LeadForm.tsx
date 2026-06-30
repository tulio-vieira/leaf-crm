import { useState, useEffect } from 'react'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import type { Board, Lead } from '../../models/Domain'
import type { PageState } from '../../models/PageState'
import { generateKeyBetween } from 'fractional-indexing'
import { createLead, updateLead, createLeadWithNewCustomer } from '../../services/leadService'
import { getBoard } from '../../services/boardService'
import LeadFormFields from './LeadFormFields'
import { Alert } from '@mui/material'
import type { CustomerFields } from '../Customer/CustomerFormFields'

interface Props {
  lead?: Lead
  currBoard?: Board
  columnCursors?: Record<string, string | undefined>
  onSuccess: () => void
  onCancel: () => void
}

function validateLead(leadFields: Partial<Lead>) {
  console.log(leadFields)
  if (
    leadFields.customerId === undefined ||
    leadFields.customerName === undefined ||
    leadFields.boardId === undefined ||
    leadFields.assignedToUserGuid === undefined ||
    leadFields.assignedToUserName === undefined
  ) return false
  return leadFields as Lead
}

function LeadForm({ lead, currBoard, columnCursors, onSuccess, onCancel }: Props) {
  const isEdit = lead !== undefined

  const [leadFields] = useState<Partial<Lead>>(lead ? { ...lead } : { boardId: currBoard?.id })
  const [formState, setFormState] = useState<PageState>({})
  const [boardState, setBoardState] = useState<PageState<Board>>({})
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing')
  const [customerFields] = useState<CustomerFields>({})
  const [customerValidationError, setCustomerValidationError] = useState<string | undefined>()

  useEffect(() => {
    if (!isEdit || currBoard || lead?.board) return

    setBoardState({ isLoading: true })
    getBoard(lead!.boardId).then(res => {
      if (res.errMsg) {
        setBoardState({ errMsg: res.errMsg })
      } else {
        leadFields.board = res.data
        setBoardState({ data: res.data })
      }
    })
  }, [])


  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()

    if (!isEdit && customerMode === 'new') {
      if (!customerFields.name) return setFormState({ errMsg: "Nome do cliente é obrigatório" })
      if (customerValidationError) return setFormState({ errMsg: customerValidationError })
      if (
        leadFields.boardId === undefined ||
        leadFields.columnIdx === undefined ||
        leadFields.assignedToUserGuid === undefined ||
        leadFields.assignedToUserName === undefined
      ) return setFormState({ errMsg: "Campos obrigatórios não preenchidos" })

      setFormState({ isLoading: true })
      const highestPos = columnCursors ? columnCursors[leadFields.columnIdx] : null
      const res = await createLeadWithNewCustomer({
        customer: customerFields as { name: string },
        description: leadFields.description,
        boardId: leadFields.boardId,
        columnIdx: leadFields.columnIdx,
        position: generateKeyBetween(highestPos ?? null, null),
        assignedToUserGuid: leadFields.assignedToUserGuid,
      })
      if (res.errMsg) return setFormState({ errMsg: res.errMsg })
      setFormState({})
      return onSuccess()
    }

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
        {boardState.isLoading
          ? <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />
          : <>
              {boardState.errMsg && <Alert severity="error" sx={{ mb: 1 }}>{boardState.errMsg}</Alert>}
              <LeadFormFields
                isEdit={isEdit}
                currBoard={boardState.data ?? currBoard}
                leadFields={leadFields}
                disabled={formState.isLoading}
                customerMode={customerMode}
                onCustomerModeChange={setCustomerMode}
                customerFields={customerFields}
                onCustomerValidationError={setCustomerValidationError}
              />
              {formState.errMsg && <Alert sx={{ mt: 1 }} severity="error">{formState.errMsg}</Alert>}
            </>
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={formState.isLoading}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={formState.isLoading}
        >
          {formState.isLoading ? <CircularProgress size={20} color="inherit" /> : isEdit ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default LeadForm
