import { useState } from 'react'
import { Link as RouterLink } from 'react-router'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ConfirmDialog from '../ConfirmDialog'
import LeadForm from './LeadForm'
import type { Lead } from '../../models/Domain'
import type { PageState } from '../../models/PageState'
import { deleteLead } from '../../services/leadService'

interface Props {
  lead: Lead
  onChanged: () => void
}

function LeadListItem({ lead, onChanged }: Props) {
  const [showDelete, setShowDelete] = useState(false)
  const [deleteState, setDeleteState] = useState<PageState>({})
  const [showEditForm, setShowEditForm] = useState(false)

  async function handleDelete() {
    setDeleteState({ isLoading: true })
    const res = await deleteLead(lead.id)
    if (res.errMsg) {
      setDeleteState({ errMsg: res.errMsg })
    } else {
      setShowDelete(false)
      setDeleteState({})
      onChanged()
    }
  }

  const truncatedDesc = lead.description && lead.description.length > 60
    ? lead.description.slice(0, 60) + '…'
    : (lead.description ?? '—')

  const boardName = lead.board?.name ?? String(lead.boardId)
  const createdAt = new Date(lead.createdAt).toLocaleDateString('pt-BR')

  return (
    <>
      <TableRow hover>
        <TableCell>
          <Link component={RouterLink} to={`/leads/${lead.id}`} underline="hover">
            {lead.name}
          </Link>
        </TableCell>
        <TableCell>{truncatedDesc}</TableCell>
        <TableCell>{boardName}</TableCell>
        <TableCell>{createdAt}</TableCell>
        <TableCell>{lead.createdByUserName ?? '—'}</TableCell>
        <TableCell>{lead.assignedToUserName ?? '—'}</TableCell>
        <TableCell align="right">
          <Tooltip title="Editar">
            <IconButton size="small" onClick={e => { e.stopPropagation(); setShowEditForm(true) }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton size="small" onClick={e => { e.stopPropagation(); setShowDelete(true) }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      {showEditForm && (
        <LeadForm
          lead={lead}
          onSuccess={() => { setShowEditForm(false); onChanged() }}
          onCancel={() => setShowEditForm(false)}
        />
      )}

      <ConfirmDialog
        open={showDelete}
        title="Excluir Lead"
        message={`Deseja excluir o lead "${lead.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        onCancel={() => { setShowDelete(false); setDeleteState({}) }}
        isLoading={deleteState.isLoading}
        errMsg={deleteState.errMsg}
      />
    </>
  )
}

export default LeadListItem
