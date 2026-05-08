import { useState } from 'react'
import { useNavigate } from 'react-router'
import Box from '@mui/material/Box'
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
import type { InsuranceAuthorization } from '../../models/Domain'
import { deleteAuthorization } from '../../services/insuranceAuthorizationService'
import { formatBRL } from '../../util/currency'
import ConfirmDialog from '../ConfirmDialog'
import PageSwitcher from '../PageSwitcher';
import InsuranceAuthorizationForm from './InsuranceAuthorizationForm';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Tooltip } from '@mui/material';

interface Props {
  insuranceAuthorizations: InsuranceAuthorization[]
  onUpdateList: () => void
  hasNextPage: boolean
  showEditButton: boolean
}

function InsuranceAuthorizationList({ insuranceAuthorizations, onUpdateList, hasNextPage, showEditButton }: Props) {
  const navigate = useNavigate()
  const [deleteErrMsg, setDeleteErrMsg] = useState<string | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<InsuranceAuthorization | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingAuth, setEditingAuth] = useState<InsuranceAuthorization | undefined>(undefined)

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    const res = await deleteAuthorization(deleteTarget.providerSlug, deleteTarget.patientId, deleteTarget.id)
    setIsDeleting(false)
    if (res.errMsg) {
      setDeleteErrMsg(res.errMsg)
      setDeleteTarget(null)
    } else {
      setDeleteErrMsg(undefined)
      setDeleteTarget(null)
      onUpdateList()
    }
  }

  async function handleEditSuccess() {
    setEditingAuth(undefined)
    onUpdateList()
  }

  return (
    <Box>
      {deleteTarget !== null && <ConfirmDialog
        open
        title="Excluir Autorização de Convênio"
        message={`Tem certeza que deseja excluir a autorização "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        errMsg={deleteErrMsg}
        onCancel={() => {setDeleteTarget(null); setDeleteErrMsg(undefined)}}
        isLoading={isDeleting}
      />}
      {editingAuth && <InsuranceAuthorizationForm
        authorization={editingAuth}
        onSuccess={handleEditSuccess}
        onClose={() => setEditingAuth(undefined)}
      />}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Convênio</TableCell>
              <TableCell>Sessões</TableCell>
              <TableCell>Preço</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Expira</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {insuranceAuthorizations.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    Nenhuma autorização ainda.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {insuranceAuthorizations.map(auth => (
              <TableRow key={auth.id}>
                <TableCell>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate(`/providers/${auth.providerSlug}/patients/${auth.patientId}/insurance-authorizations/${auth.id}`)}
                    sx={{ fontWeight: 600 }}
                  >
                    {auth.name}
                  </Link>
                </TableCell>
                <TableCell>{auth.insuranceName}</TableCell>
                <TableCell>{auth.attachedSessionCount} / {auth.authorizedSessionCount}</TableCell>
                <TableCell>{formatBRL(auth.priceCents)}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    {auth.remainingSessions === 0 && <Chip label="Completa" color="secondary" size="small" />}
                    {auth.paymentReceived && <Chip label="Pago" color="success" size="small" />}
                    {auth.expired && <Tooltip placement="top" title="Expirada">
                      <ReportGmailerrorredIcon color="warning"/>
                    </Tooltip>}
                    {auth.aboutToExpire && <Tooltip placement="top" title="Prestes a Expirar">
                      <AccessTimeIcon color="warning"/>
                    </Tooltip>}
                    {auth.aboutToBeFull && <Tooltip placement="top" title="Prestes a Ficar Completa">
                      <WarningAmberIcon color="warning" />
                    </Tooltip>}
                  </Stack>
                </TableCell>
                <TableCell>{new Date(auth.expiresAt).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                    {showEditButton && (
                      <IconButton size="small" color="primary" onClick={() => setEditingAuth(auth)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(auth)}>
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
    </Box>
  )
}

export default InsuranceAuthorizationList
