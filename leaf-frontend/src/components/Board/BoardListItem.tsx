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
import BoardForm from './BoardForm'
import type { Board } from '../../models/Domain'
import type { PageState } from '../../models/PageState'
import { deleteBoard } from '../../services/boardService'

interface Props {
  board: Board
  onChanged: () => void
}

function BoardListItem({ board, onChanged }: Props) {
  const [showDelete, setShowDelete] = useState(false)
  const [deleteState, setDeleteState] = useState<PageState>({})
  const [showEditForm, setShowEditForm] = useState(false)

  async function handleDelete() {
    setDeleteState({ isLoading: true })
    const res = await deleteBoard(board.id)
    if (res.errMsg) {
      setDeleteState({ errMsg: res.errMsg })
    } else {
      setShowDelete(false)
      setDeleteState({})
      onChanged()
    }
  }

  const truncatedDesc = board.description && board.description.length > 60
    ? board.description.slice(0, 60) + '…'
    : (board.description || '—')

  return (
    <>
      <TableRow hover>
        <TableCell>
          <Link component={RouterLink} to={`/boards/${board.id}`} underline="hover">
            {board.name}
          </Link>
        </TableCell>
        <TableCell>{truncatedDesc}</TableCell>
        <TableCell>{board.id}</TableCell>
        <TableCell>{board.columns.length}</TableCell>
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
        <BoardForm
          board={board}
          onSuccess={() => { setShowEditForm(false); onChanged() }}
          onCancel={() => setShowEditForm(false)}
        />
      )}

      <ConfirmDialog
        open={showDelete}
        title="Excluir Quadro"
        message={`Deseja excluir o quadro "${board.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        onCancel={() => { setShowDelete(false); setDeleteState({}) }}
        isLoading={deleteState.isLoading}
        errMsg={deleteState.errMsg}
      />
    </>
  )
}

export default BoardListItem
