import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTheme } from '@mui/material/styles'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'
import { generateKeyBetween } from 'fractional-indexing'
import { Kanban, dropHandler } from 'react-kanban-kit'
import type { BoardData, BoardItem, BoardProps } from 'react-kanban-kit'
import type { Board, Lead } from '../../models/Domain'
import type { PageState } from '../../models/PageState'
import { listColumnLeads, updateLead } from '../../services/leadService'

type ConfigMap = BoardProps['configMap']
type DropCardParams = Parameters<Required<BoardProps>['onCardMove']>[0]

interface Props {
  board: Board
  columnCounts: number[]
}

function buildInitialBoardData(board: Board, columnCounts: number[]): BoardData {
  const columnIds = board.columns.map((_, i) => `col-${i}`)

  const root: BoardItem = {
    id: 'root',
    title: board.name,
    parentId: null,
    children: columnIds,
    totalChildrenCount: columnIds.length,
  }

  const columnItems: [string, BoardItem][] = board.columns.map((col, i) => [
    `col-${i}`,
    {
      id: `col-${i}`,
      title: col.name,
      parentId: 'root',
      children: [],
      totalChildrenCount: columnCounts[i] ?? 0,
      isDraggable: false,
    },
  ])

  return Object.fromEntries([['root', root], ...columnItems]) as BoardData
}

function BoardKanban({ board, columnCounts }: Props) {
  const navigate = useNavigate()
  const theme = useTheme()

  const [boardData, setBoardData] = useState<BoardData>(() => buildInitialBoardData(board, columnCounts))
  const [columnCursors, setColumnCursors] = useState<Record<string, string | undefined>>({})
  const loadingColumnsRef = useRef<Set<string>>(new Set())
  const [moveState, setMoveState] = useState<PageState>({})

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
              border: `1px solid ${theme.palette.divider}`,
              '&:hover': { bgcolor: 'action.hover' },
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
              {lead.name}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
              Position: {lead.position}
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

  async function handleLoadMore(columnId: string) {
    if (loadingColumnsRef.current.has(columnId)) return

    const col = boardData[columnId]
    if (!col || col.children.length >= col.totalChildrenCount) return

    loadingColumnsRef.current.add(columnId)

    const colIdx = parseInt(columnId.replace('col-', ''))
    const afterPosition = columnCursors[columnId]

    const res = await listColumnLeads({ boardId: board.id, columnIdx: colIdx, afterPosition })
    loadingColumnsRef.current.delete(columnId)

    if (res.errMsg || !res.data || res.data.items.length === 0) return

    const newLeads = res.data.items
    const last = newLeads[newLeads.length - 1]
    if (last.position != null) {
      setColumnCursors(prev => ({ ...prev, [columnId]: last.position! }))
    }

    const newCardEntries: [string, BoardItem][] = newLeads.map(lead => [
      `${lead.id}`,
      {
        id: `${lead.id}`,
        title: lead.name,
        parentId: columnId,
        children: [],
        totalChildrenCount: 0,
        content: lead,
        type: 'lead',
      },
    ])

    setBoardData(prev => {
      const c = prev[columnId]
      if (!c) return prev
      return {
        ...prev,
        ...Object.fromEntries(newCardEntries),
        [columnId]: { ...c, children: [...c.children, ...newLeads.map(l => `${l.id}`)] },
      }
    })
  }

  useEffect(() => {
    board.columns.forEach((_, i) => {
      if ((columnCounts[i] ?? 0) > 0) {
        handleLoadMore(`col-${i}`)
      }
    })
  }, [])

  async function handleCardMove(cardMove: DropCardParams) {
    const prevData = boardData
    setBoardData(prev => dropHandler(
      cardMove,
      prev,
      undefined,
      (col) => ({ ...col, totalChildrenCount: col.totalChildrenCount + 1 }),
      (col) => ({ ...col, totalChildrenCount: Math.max(0, col.totalChildrenCount - 1) }),
    ))
    const leadId = parseInt(cardMove.cardId)
    const newColumnIdx = parseInt(cardMove.toColumnId.replace('col-', ''))
    const lead = boardData[`${leadId}`]?.content as Lead | undefined
    if (!lead) return

    setMoveState({ isLoading: true })

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

    let newPosition: string | null = null
    try {
      newPosition = generateKeyBetween(belowPos, abovePos)
    } catch {
      newPosition = null
    }

    const res = await updateLead(leadId, {
      name: lead.name,
      description: lead.description,
      boardId: lead.boardId,
      columnIdx: newColumnIdx,
      position: newPosition ?? undefined,
    })

    if (res.errMsg) {
      setBoardData(prevData)
      setMoveState({ errMsg: res.errMsg })
    } else {
      setMoveState({})
    }
  }

  function handleCardClick(_e: React.MouseEvent<HTMLDivElement>, card: BoardItem) {
    navigate(`/leads/${card.id}`)
  }

  return (
    <Box sx={{ overflowX: 'auto', pb: 2 }}>
      <Kanban
        dataSource={boardData}
        configMap={configMap}
        onCardMove={handleCardMove}
        onCardClick={handleCardClick}
        loadMore={handleLoadMore}
        renderSkeletonCard={() => (
          <Paper elevation={2} sx={{ p: 1.5, borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="80%" />
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
            <Chip label={column.totalChildrenCount} size="small" color="default" />
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
      {/* <Snackbar
        open={moveSuccess}
        autoHideDuration={3000}
        onClose={() => setMoveSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setMoveSuccess(false)}>
          Lead movido com sucesso.
        </Alert>
      </Snackbar> */}
    </Box>
  )
}

export default BoardKanban
