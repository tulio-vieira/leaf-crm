import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import BoardList from '../components/Board/BoardList'
import BoardForm from '../components/Board/BoardForm'
import type { PagedResponse, Board } from '../models/Domain'
import type { PageState } from '../models/PageState'
import { listBoards } from '../services/boardService'

function BoardScreen() {
  const [searchParams] = useSearchParams()
  const [boardsState, setBoardsState] = useState<PageState<PagedResponse<Board>>>({ isLoading: true })
  const [refreshKey, setRefreshKey] = useState(0)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    setBoardsState({ isLoading: true })
    const page = parseInt(searchParams.get('page') ?? '1')
    listBoards({ page }).then(res => {
      if (res.errMsg) setBoardsState({ errMsg: res.errMsg })
      else setBoardsState({ data: res.data })
    })
  }, [searchParams, refreshKey])

  function handleChanged() {
    setRefreshKey(k => k + 1)
  }

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Quadros</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateForm(true)}
        >
          Novo Quadro
        </Button>
      </Stack>

      {boardsState.isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {boardsState.errMsg && <Alert severity="error">{boardsState.errMsg}</Alert>}
      {boardsState.data && (
        <BoardList
          boards={boardsState.data.items}
          hasNextPage={boardsState.data.hasNextPage}
          onChanged={handleChanged}
        />
      )}

      {showCreateForm && (
        <BoardForm
          onSuccess={() => { setShowCreateForm(false); handleChanged() }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </Box>
  )
}

export default BoardScreen
