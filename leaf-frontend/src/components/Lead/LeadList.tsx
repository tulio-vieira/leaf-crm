import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import PageSwitcher from '../PageSwitcher'
import LeadListItem from './LeadListItem'
import type { Lead } from '../../models/Domain'

interface Props {
  leads: Lead[]
  hasNextPage: boolean
  onChanged: () => void
}

function LeadList({ leads, hasNextPage, onChanged }: Props) {
  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Funil</TableCell>
              <TableCell>Criado em</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    Nenhum lead encontrado.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              leads.map(lead => (
                <LeadListItem key={lead.id} lead={lead} onChanged={onChanged} />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <PageSwitcher hasNextPage={hasNextPage} />
    </>
  )
}

export default LeadList
