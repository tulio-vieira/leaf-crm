import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import type { Insurance } from '../models/Domain'
import { deleteInsurance } from '../services/insuranceService'
import ConfirmDialog from './ConfirmDialog'

interface Props {
  insurances: Insurance[]
  onEditRequest: (insurance: Insurance) => void
  onDeleted: () => void
}

function InsuranceList({ insurances, onEditRequest, onDeleted }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<Insurance | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    const res = await deleteInsurance(deleteTarget.id)
    setIsDeleting(false)
    setDeleteTarget(null)
    if (res.errMsg) {
      setErrMsg(res.errMsg)
    } else {
      onDeleted()
    }
  }

  return (
    <Box>
      {errMsg && <Alert severity="error" sx={{ mb: 1 }}>{errMsg}</Alert>}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Excluir Convênio"
        message={`Tem certeza que deseja excluir o convênio "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {insurances.length === 0 && (
              <TableRow>
                <TableCell colSpan={3}>
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    Nenhum convênio cadastrado.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {insurances.map(ins => (
              <TableRow key={ins.id}>
                <TableCell>{ins.name}</TableCell>
                <TableCell>{ins.description ?? '—'}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                    <IconButton size="small" color="primary" onClick={() => onEditRequest(ins)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(ins)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default InsuranceList
