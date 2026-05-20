import { useState } from 'react'
import { Link as RouterLink } from 'react-router'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ConfirmDialog from '../ConfirmDialog'
import CustomerForm from './CustomerForm'
import type { Customer } from '../../models/Domain'
import type { PageState } from '../../models/PageState'
import { deleteCustomer } from '../../services/customerService'

interface Props {
  customer: Customer
  onChanged: () => void
}

function CustomerListItem({ customer, onChanged }: Props) {
  const [showDelete, setShowDelete] = useState(false)
  const [deleteState, setDeleteState] = useState<PageState>({})
  const [showEditForm, setShowEditForm] = useState(false)

  async function handleDelete() {
    setDeleteState({ isLoading: true })
    const res = await deleteCustomer(customer.id)
    if (res.errMsg) {
      setDeleteState({ errMsg: res.errMsg })
    } else {
      setShowDelete(false)
      setDeleteState({})
      onChanged()
    }
  }

  return (
    <>
      <TableRow hover>
        <TableCell>
          <Link component={RouterLink} to={`/customers/${customer.id}`} underline="hover">
            {customer.name}
          </Link>
        </TableCell>
        <TableCell>{customer.company ?? '—'}</TableCell>
        <TableCell>{customer.email ?? '—'}</TableCell>
        <TableCell>{customer.phoneNumber ?? '—'}</TableCell>
        <TableCell align="right">
          <Tooltip title="Editar">
            <IconButton size="small" onClick={e => { e.stopPropagation(); setShowEditForm(true) }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton size="small" onClick={e => { e.stopPropagation(); setShowDelete(true) }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      {showEditForm && (
        <CustomerForm
          customer={customer}
          onSuccess={() => { setShowEditForm(false); onChanged() }}
          onCancel={() => setShowEditForm(false)}
        />
      )}

      <ConfirmDialog
        open={showDelete}
        title="Excluir Cliente"
        message={`Deseja excluir o cliente "${customer.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        onCancel={() => { setShowDelete(false); setDeleteState({}) }}
        isLoading={deleteState.isLoading}
        errMsg={deleteState.errMsg}
      />
    </>
  )
}

export default CustomerListItem
