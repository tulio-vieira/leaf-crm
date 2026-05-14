import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import BoardKanban from '../components/Board/BoardKanban'
import LeadForm from '../components/Lead/LeadForm'
import type { Board, Lead } from '../models/Domain'
import type { PageState } from '../models/PageState'
import { getBoard } from '../services/boardService'
import { listAllLeads } from '../services/leadService'


interface BoardDetail {
  board: Board
  columnCursors: Record<number, string>
}

function calculateColumnCursors(leads?: Lead[]) {
  const columnCursors: Record<number, string> = {}
  if (!leads) return columnCursors
  for (let l of leads) {
    if (!columnCursors[l.columnIdx]) columnCursors[l.columnIdx] = l.position
  }
  return columnCursors
}


function BoardDetail() {
  const { id } = useParams()
  const [boardState, setBoardState] = useState<PageState<BoardDetail>>({ isLoading: true })
  const [leadsState, setLeadsState] = useState<PageState<Lead[]>>({ isLoading: true })
  const [refreshKey, setRefreshKey] = useState(0)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const boardId = id ? parseInt(id) : undefined

  useEffect(() => {
    if (!boardId) return
    setBoardState({ isLoading: true })
    setLeadsState({ isLoading: true })
    Promise.all([
      getBoard(boardId),
      listAllLeads({ boardId }),
    ]).then(([boardRes, leadsRes]) => {
      if (boardRes.errMsg) setBoardState({ errMsg: boardRes.errMsg })
      else {
        if (!boardRes.data) return
        setBoardState({ data: {
          board: boardRes.data,
          columnCursors: calculateColumnCursors(leadsRes.data)
        }})
      }
      if (leadsRes.errMsg) setLeadsState({ errMsg: leadsRes.errMsg })
      else setLeadsState({ data: leadsRes.data })
    })
  }, [boardId, refreshKey])

  const isLoading = boardState.isLoading || leadsState.isLoading
  const errMsg = boardState.errMsg ?? leadsState.errMsg

  function handleRefresh() {
    setRefreshKey(k => k + 1)
  }

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {boardState.data?.board.name ?? 'Quadro'}
        </Typography>
        {boardState.data && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateForm(true)}
          >
            Novo Lead
          </Button>
        )}
      </Stack>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {errMsg && <Alert severity="error">{errMsg}</Alert>}

      {boardState.data && leadsState.data && (
        <BoardKanban
          board={boardState.data.board}
          leads={leadsState.data}
        />
      )}

      {showCreateForm && boardId && boardState.data?.board && (
        <LeadForm
          currBoard={boardState.data.board}
          columnCursors={boardState.data.columnCursors}
          onSuccess={() => { setShowCreateForm(false); handleRefresh() }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </Box>
  )
}

export default BoardDetail
