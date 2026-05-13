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

function BoardDetail() {
  const { id } = useParams()
  const [boardState, setBoardState] = useState<PageState<Board>>({ isLoading: true })
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
      else setBoardState({ data: boardRes.data })
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
          {boardState.data?.name ?? 'Quadro'}
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
          board={boardState.data}
          leads={leadsState.data}
        />
      )}

      {showCreateForm && boardId && (
        <LeadForm
          defaultBoardId={boardId}
          onSuccess={() => { setShowCreateForm(false); handleRefresh() }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </Box>
  )
}

export default BoardDetail
