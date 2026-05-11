import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import QueryFilters, { type FilterItem } from '../components/QueryFilters'
import LeadList from '../components/Lead/LeadList'
import LeadForm from '../components/Lead/LeadForm'
import type { Board, PagedResponse, Lead } from '../models/Domain'
import type { PageState } from '../models/PageState'
import { listAllBoards } from '../services/boardService'
import { listLeads } from '../services/leadService'

function LeadScreen() {
  const [searchParams] = useSearchParams()
  const [leadsState, setLeadsState] = useState<PageState<PagedResponse<Lead>>>({ isLoading: true })
  const [boardsState, setBoardsState] = useState<PageState<Board[]>>({ isLoading: true })
  const [refreshKey, setRefreshKey] = useState(0)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    listAllBoards().then(res => {
      if (res.errMsg) setBoardsState({ errMsg: res.errMsg })
      else setBoardsState({ data: res.data })
    })
  }, [])

  useEffect(() => {
    setLeadsState({ isLoading: true })
    const page = parseInt(searchParams.get('page') ?? '1')
    const boardIdParam = searchParams.get('boardId')
    const boardId = boardIdParam ? parseInt(boardIdParam) : undefined
    listLeads({ page, boardId }).then(res => {
      if (res.errMsg) setLeadsState({ errMsg: res.errMsg })
      else setLeadsState({ data: res.data })
    })
  }, [searchParams, refreshKey])

  const filterItems: FilterItem[] = [
    {
      queryParam: 'boardId',
      inputType: 'dropdown',
      displayName: 'Funil',
      availableOptions: (boardsState.data ?? []).map(b => ({ displayName: b.name, value: b.id })),
    },
  ]

  function handleChanged() {
    setRefreshKey(k => k + 1)
  }

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Leads</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateForm(true)}
        >
          Novo Lead
        </Button>
      </Stack>

      {boardsState.isLoading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">Carregando filtros...</Typography>
        </Box>
      ) : (
        <QueryFilters filterItems={filterItems} />
      )}

      {leadsState.isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {leadsState.errMsg && <Alert severity="error">{leadsState.errMsg}</Alert>}
      {leadsState.data && (
        <LeadList
          leads={leadsState.data.items}
          hasNextPage={leadsState.data.hasNextPage}
          onChanged={handleChanged}
        />
      )}

      {showCreateForm && (
        <LeadForm
          onSuccess={() => { setShowCreateForm(false); handleChanged() }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </Box>
  )
}

export default LeadScreen
