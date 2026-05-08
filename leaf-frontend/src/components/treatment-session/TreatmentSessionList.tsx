import { useState } from 'react'
import { useNavigate } from 'react-router'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
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
import type { TreatmentSession } from '../../models/Domain'
import { deleteSession } from '../../services/treatmentSessionService'
import { formatBRL } from '../../util/currency'
import ConfirmDialog from '../ConfirmDialog'
import TreatmentSessionForm from './TreatmentSessionForm';
import PageSwitcher from '../PageSwitcher';

interface Props {
  sessions: TreatmentSession[]
  onUpdateList: () => void
  hasNextPage: boolean
  showEditButton: boolean
}

function TreatmentSessionList({ sessions, onUpdateList, hasNextPage, showEditButton }: Props) {
  const navigate = useNavigate()
  const [deleteErrMsg, setDeleteErrMsg] = useState<string | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<TreatmentSession | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingTarget, setEditingTarget] = useState<TreatmentSession | undefined>(undefined)

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    const res = await deleteSession(
      deleteTarget.providerSlug,
      String(deleteTarget.patientId),
      deleteTarget.id
    )
    setIsDeleting(false)
    setDeleteTarget(null)
    if (res.errMsg) {
      setDeleteErrMsg(res.errMsg)
    } else {
      setDeleteErrMsg(undefined)
      setDeleteTarget(null)
      onUpdateList()
    }
  }

  async function handleEditSuccess() {
    setEditingTarget(undefined)
    onUpdateList()
  }

  return (
    <>
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Excluir Agendamento"
        message={`Tem certeza que deseja excluir o agendamento "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        errMsg={deleteErrMsg}
        onCancel={() => {setDeleteTarget(null); setDeleteErrMsg(undefined)}}
        isLoading={isDeleting}
      />
      {editingTarget && <TreatmentSessionForm
        session={editingTarget}
        onSuccess={handleEditSuccess}
        onClose={() => setEditingTarget(undefined)}
      />}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Preço</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    Nenhum agendamento ainda.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {sessions.map(session => (
              <TableRow key={session.id}>
                <TableCell>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate(`/providers/${session.providerSlug}/patients/${session.patientId}/treatment-sessions/${session.id}`)}
                    sx={{ fontWeight: 600 }}
                  >
                    {session.name}
                  </Link>
                </TableCell>
                <TableCell>{new Date(session.start).toLocaleString('pt-BR')}</TableCell>
                <TableCell>
                  {session.priceCents != null ? formatBRL(session.priceCents) : '—'}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    {session.paymentReceived && <Chip label="Pago" color="success" size="small" />}
                    {session.insuranceAuthorizationId != null && (
                      <Chip label="Convênio" color="secondary" size="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                    {showEditButton && (
                      <IconButton size="small" color="primary" onClick={() => setEditingTarget(session)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(session)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <PageSwitcher hasNextPage={hasNextPage} />
    </>
  )
}

export default TreatmentSessionList
