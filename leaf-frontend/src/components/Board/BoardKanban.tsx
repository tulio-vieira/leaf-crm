import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTheme } from '@mui/material/styles'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'
import { Kanban, dropHandler } from 'react-kanban-kit'
import type { BoardData, BoardItem, BoardProps } from 'react-kanban-kit'
import type { Board, Lead } from '../../models/Domain'
import type { PageState } from '../../models/PageState'
import { updateLead } from '../../services/leadService'

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
        children: colLeads.map(l => `lead-${l.id}`),
        totalChildrenCount: colLeads.length,
        isDraggable: false,
      },
    ]
  })

  const cardItems: [string, BoardItem][] = leads.map(lead => [
    `lead-${lead.id}`,
    {
      id: `lead-${lead.id}`,
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
  const [moveState, setMoveState] = useState<PageState>({})
  const [moveSuccess, setMoveSuccess] = useState(false)

  useEffect(() => {
    setBoardData(buildBoardData(board, leads))
  }, [board, leads])

  const configMap: ConfigMap = {
    lead: {
      render: ({ data }: { data: BoardItem; column: BoardItem; index: number; isDraggable: boolean }) => {
        const lead = data.content as Lead
        return (
          <Paper
            elevation={2}
            sx={{
              p: 1.5,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
              {lead.name}
            </Typography>
            {lead.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {lead.description}
              </Typography>
            )}
          </Paper>
        )
      },
      isDraggable: true,
    },
  }

  async function handleCardMove(cardMove: DropCardParams) {
    const prevData = boardData  
    const leadId = parseInt(cardMove.cardId.replace('lead-', ''))
    const lead = prevData[`lead-${leadId}`]?.content as Lead | undefined
    if (!lead) return
    setMoveState({ isLoading: true })
    const newColumnIdx = parseInt(cardMove.toColumnId.replace('col-', ''))

    const res = await updateLead(leadId, {
      name: lead.name,
      description: lead.description,
      boardId: lead.boardId,
      columnIdx: newColumnIdx,
    })

    if (res.errMsg) {
      setMoveState({ errMsg: res.errMsg })
      return
    }
    setBoardData(prev =>
      dropHandler(
        cardMove,
        prev,
        undefined,
        (col) => ({ ...col, totalChildrenCount: col.totalChildrenCount + 1 }),
        (col) => ({ ...col, totalChildrenCount: col.totalChildrenCount - 1 }),
      )
    )
    setMoveState({})
    setMoveSuccess(true)
  }

  function handleCardClick(_e: React.MouseEvent<HTMLDivElement>, card: BoardItem) {
    const leadId = card.id.replace('lead-', '')
    navigate(`/leads/${leadId}`)
  }

  return (
    <Box sx={{ overflowX: 'auto', pb: 2 }}>
      <Kanban
        dataSource={boardData}
        configMap={configMap}
        onCardMove={handleCardMove}
        onCardClick={handleCardClick}
        viewOnly={moveState.isLoading === true}
        rootStyle={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}
        columnWrapperStyle={() => ({
          minWidth: 260,
          maxWidth: 300,
          margin: '0 4px',
          flexShrink: 0,
        })}
        columnStyle={() => ({
          background: theme.palette.background.paper,
          borderRadius: '8px',
        })}
        renderColumnHeader={(column) => (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {column.title}
            </Typography>
            <Chip label={column.children.length} size="small" color="default" />
          </Box>
        )}
        columnListContentStyle={() => ({
          padding: '8px',
          minHeight: '60vh',
          gap: 8,
        })}
      />

      <Snackbar
        open={!!moveState.errMsg}
        autoHideDuration={4000}
        onClose={() => setMoveState({})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setMoveState({})}>
          {moveState.errMsg}
        </Alert>
      </Snackbar>

      <Snackbar
        open={moveSuccess}
        autoHideDuration={3000}
        onClose={() => setMoveSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setMoveSuccess(false)}>
          Lead movido com sucesso.
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default BoardKanban
