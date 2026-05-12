import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import PageSwitcher from '../PageSwitcher'
import BoardListItem from './BoardListItem'
import type { Board } from '../../models/Domain'

interface Props {
  boards: Board[]
  hasNextPage: boolean
  onChanged: () => void
}

function BoardList({ boards, hasNextPage, onChanged }: Props) {
  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Colunas</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {boards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    Nenhum quadro encontrado.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              boards.map(board => (
                <BoardListItem key={board.id} board={board} onChanged={onChanged} />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <PageSwitcher hasNextPage={hasNextPage} />
    </>
  )
}

export default BoardList
