import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTheme } from '@mui/material/styles'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'
import { Kanban, dropHandler } from 'react-kanban-kit'
import type { BoardData, BoardItem, BoardProps } from 'react-kanban-kit'
import type { Board, Lead } from '../../models/Domain'
import { updateLead } from '../../services/leadService'

type ConfigMap = BoardProps['configMap']
type DropCardParams = Parameters<Required<BoardProps>['onCardMove']>[0]

interface Props {
  board: Board
  leads: Lead[]
  onRefresh: () => void
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

  const columnItems: [string, BoardItem][] = board.columns.map((col, i) => {
    const colLeads = leads.filter(l => l.columnIdx === i)
    return [
      `col-${i}`,
      {
        id: `col-${i}`,
        title: col.name,
        parentId: 'root',
        children: colLeads.map(l => `lead-${l.id}`),
        totalChildrenCount: colLeads.length,
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

function BoardKanban({ board, leads, onRefresh }: Props) {
  const navigate = useNavigate()
  const theme = useTheme()
  const [boardData, setBoardData] = useState<BoardData>(() => buildBoardData(board, leads))
  const [moveError, setMoveError] = useState<string | null>(null)

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
    const { position: _position, ...dropParams } = cardMove
    setBoardData(prev => dropHandler(dropParams, prev))

    const leadId = parseInt(cardMove.cardId.replace('lead-', ''))
    const newColumnIdx = parseInt(cardMove.toColumnId.replace('col-', ''))
    const lead = leads.find(l => l.id === leadId)
    if (!lead) return

    const res = await updateLead(leadId, {
      name: lead.name,
      description: lead.description,
      boardId: lead.boardId,
      columnIdx: newColumnIdx,
    })

    if (res.errMsg) {
      setMoveError(res.errMsg)
      onRefresh()
    }
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
        rootStyle={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}
        columnWrapperStyle={() => ({
          background: theme.palette.background.paper,
          borderRadius: 8,
          minWidth: 260,
          maxWidth: 300,
          margin: '0 8px',
          flexShrink: 0,
        })}
        columnHeaderStyle={() => ({
          padding: '12px 16px',
          borderBottom: `1px solid ${theme.palette.divider}`,
          fontWeight: 700,
          fontSize: '0.875rem',
          color: theme.palette.text.primary,
        })}
        columnListContentStyle={() => ({
          padding: '8px',
          minHeight: 200,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        })}
      />

      <Snackbar
        open={moveError !== null}
        autoHideDuration={4000}
        onClose={() => setMoveError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setMoveError(null)}>
          {moveError}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default BoardKanban
