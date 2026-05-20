import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import PageSwitcher from '../PageSwitcher'
import CustomerListItem from './CustomerListItem'
import type { Customer } from '../../models/Domain'

interface Props {
  customers: Customer[]
  hasNextPage: boolean
  onChanged: () => void
}

function CustomerList({ customers, hasNextPage, onChanged }: Props) {
  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Empresa</TableCell>
              <TableCell>E-mail</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    Nenhum cliente encontrado.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              customers.map(customer => (
                <CustomerListItem key={customer.id} customer={customer} onChanged={onChanged} />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <PageSwitcher hasNextPage={hasNextPage} />
    </>
  )
}

export default CustomerList
