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
import type { BoardDetailResponse } from '../models/Domain'
import type { PageState } from '../models/PageState'
import { getBoard } from '../services/boardService'

function BoardDetail() {
  const { id } = useParams()
  const [boardState, setBoardState] = useState<PageState<BoardDetailResponse>>({ isLoading: true })
  const [refreshKey, setRefreshKey] = useState(0)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const boardId = id ? parseInt(id) : undefined

  useEffect(() => {
    if (!boardId) return
    setBoardState({ isLoading: true })
    getBoard(boardId).then(res => {
      if (res.errMsg) setBoardState({ errMsg: res.errMsg })
      else setBoardState({ data: res.data })
    })
  }, [boardId, refreshKey])

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

      {boardState.isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {boardState.errMsg && <Alert severity="error">{boardState.errMsg}</Alert>}

      {boardState.data && (
        <BoardKanban
          key={refreshKey}
          board={boardState.data.board}
          columnCounts={boardState.data.columnCounts}
        />
      )}

      {showCreateForm && boardId && boardState.data && (
        <LeadForm
          currBoard={boardState.data.board}
          onSuccess={() => { setShowCreateForm(false); handleRefresh() }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </Box>
  )
}

export default BoardDetail
