import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTheme } from '@mui/material/styles'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'
import { generateKeyBetween } from 'fractional-indexing'
import { Kanban, dropHandler } from 'react-kanban-kit'
import type { BoardData, BoardItem, BoardProps } from 'react-kanban-kit'
import type { Board, Lead } from '../../models/Domain'
import type { PageState } from '../../models/PageState'
import { listColumnLeads, updateLead } from '../../services/leadService'
import LeadCard from './LeadCard';
import { Button } from '@mui/material';

type ConfigMap = BoardProps['configMap']
type DropCardParams = Parameters<Required<BoardProps>['onCardMove']>[0]

interface Props {
  board: Board
  leads: Lead[]
}

function buildBoardData(board: Board, leads: Lead[]): BoardData {
  const columnIds = board.columns.map((_, i) => `col-${i}`)

  const root: BoardItem = {
    id: 'root',
    title: board.name,
    parentId: null,
    children: columnIds,
    totalChildrenCount: columnIds.length,
  }

  const byCol = new Map<number, Lead[]>()
  for (const lead of leads) {
    const bucket = byCol.get(lead.columnIdx) ?? []
    bucket.push(lead)
    byCol.set(lead.columnIdx, bucket)
  }

  const columnItems: [string, BoardItem][] = board.columns.map((col, i) => {
    const colLeads = byCol.get(i) ?? []
    return [
      `col-${i}`,
      {
        id: `col-${i}`,
        title: col.name,
        parentId: 'root',
        children: colLeads.map(l => `${l.id}`),
        totalChildrenCount: colLeads.length + 1,
        isDraggable: false,
      },
    ]
  })

  const cardItems: [string, BoardItem][] = leads.map(lead => [
    `${lead.id}`,
    {
      id: `${lead.id}`,
      title: lead.name,
      parentId: `col-${lead.columnIdx}`,
      children: [],
      totalChildrenCount: 0,
      content: lead,
      type: 'lead',
    },
  ])

  return Object.fromEntries([['root', root], ...columnItems, ...cardItems]) as BoardData
}

function BoardKanban({ board, leads }: Props) {
  const navigate = useNavigate()
  const theme = useTheme()
  const [boardData, setBoardData] = useState<BoardData>(() => buildBoardData(board, leads))
  const [reqState, setReqState] = useState<PageState<string>>({})

  const configMap: ConfigMap = {
    lead: {
      render: ({ data }: { data: BoardItem }) => {
        const lead = data.content as Lead
        return <LeadCard lead={lead} theme={theme}/>
      },
      isDraggable: true,
    },
  }

  async function handleLoadMore(column: BoardItem) {
    if (reqState.isLoading) return
    const colIdx = parseInt(column.id.replace('col-', ''))

    const afterPosition = column.children.length ? boardData[column.children[column.children.length - 1]].content.position : null

    setReqState({ isLoading: true })
    const res = await listColumnLeads({ boardId: board.id, columnIdx: colIdx, afterPosition })

    if (res.errMsg) {
      setReqState({ errMsg: res.errMsg })
      return
    }
    if (!res.data) return

    const newLeads = res.data.items

    const newCardEntries: [string, BoardItem][] = newLeads.map(lead => [
      `${lead.id}`,
      {
        id: `${lead.id}`,
        title: lead.name,
        parentId: column.id,
        children: [],
        totalChildrenCount: 0,
        content: lead,
        type: 'lead',
      },
    ])
    setBoardData(prev => {
      const c = prev[column.id]
      const newChildren = [...c.children, ...newLeads.map(l => `${l.id}`)]
      const newCount = newChildren.length + (res.data?.hasNextPage ? 1 : 0)
      if (!c) return prev
      return {
        ...prev,
        ...Object.fromEntries(newCardEntries),
        [column.id]: { ...c, totalChildrenCount: newCount, children: newChildren },
      }
    })
    setReqState({})
  }

  async function handleCardMove(cardMove: DropCardParams) {
    if (reqState.isLoading) return
    const prevData = boardData
    const leadId = parseInt(cardMove.cardId)
    const newColumnIdx = parseInt(cardMove.toColumnId.replace('col-', ''))
    const lead = boardData[`${leadId}`]?.content as Lead | undefined
    if (!lead) return

    setReqState({ isLoading: true })

    // Leads are displayed descending (highest position = top of column).
    // taskAbove is visually higher → fractionally higher value.
    // taskBelow is visually lower  → fractionally lower value.
    // generateKeyBetween expects (lower, upper), so arguments are swapped.
    const abovePos = cardMove.taskAbove
      ? ((boardData[cardMove.taskAbove]?.content as Lead | undefined)?.position ?? null)
      : null
    const belowPos = cardMove.taskBelow
      ? ((boardData[cardMove.taskBelow]?.content as Lead | undefined)?.position ?? null)
      : null

    let newPosition = "a0"
    try {
      newPosition = generateKeyBetween(belowPos, abovePos)
    } catch {}

    const newLead = {...lead, columnIdx: newColumnIdx, position: newPosition }

    setBoardData(prev => {
      prev[`${leadId}`].content = newLead
      return dropHandler(
        cardMove,
        prev,
        undefined,
        (col) => ({ ...col, totalChildrenCount: col.totalChildrenCount + 1 }),
        (col) => ({ ...col, totalChildrenCount: col.totalChildrenCount - 1 }),
      )
    })

    const res = await updateLead(leadId, newLead)

    if (res.errMsg) {
      setBoardData(prevData)
      setReqState({ errMsg: res.errMsg })
    } else {
      setReqState({ data: "Lead movido com sucesso."})
    }
  }

  return (
    <Box sx={{ overflowX: 'auto', pb: 2 }}>
      <Kanban
        dataSource={boardData}
        configMap={configMap}
        onCardMove={handleCardMove}
        onCardClick={(_, card) => navigate(`/leads/${card.id}`)}
        renderSkeletonCard={({column}) => (
          <Paper elevation={2} sx={{ p: 1.5, borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
            <Button onClick={() => handleLoadMore(column)}>Carregar Mais</Button>
          </Paper>
        )}
        rootStyle={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}
        columnWrapperStyle={() => ({
          minWidth: 260,
          maxWidth: 300,
          margin: '0 4px',
          flexShrink: 0,
        })}
        columnStyle={() => ({
          background: theme.palette.background.default,
          borderRadius: '8px',
          border: `1px solid ${theme.palette.divider}`,
        })}
        renderColumnHeader={(column) => (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {column.title}
            </Typography>
          </Box>
        )}
        columnListContentStyle={() => ({
          padding: '8px',
          minHeight: '60vh',
          gap: 8,
        })}
      />

      <Snackbar
        open={reqState.errMsg !== undefined}
        autoHideDuration={4000}
        onClose={() => setReqState({})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setReqState({})}>
          {reqState.errMsg}
        </Alert>
      </Snackbar>
      <Snackbar
        open={reqState.data !== undefined}
        autoHideDuration={3000}
        onClose={() => setReqState({})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setReqState({})}>
          Lead movido com sucesso.
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default BoardKanban
