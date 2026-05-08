import { useState } from 'react'
import { useNavigate } from 'react-router'
import Box from '@mui/material/Box'
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
import type { Patient } from '../../models/Domain'
import PageSwitcher from '../PageSwitcher';
import { deletePatient } from '../../services/patientService';
import ConfirmDialog from '../ConfirmDialog';
import PatientForm from './PatientForm';

interface Props {
  patients: Patient[]
  onUpdateList: () => void
  hasNextPage: boolean
  showEditButton: boolean
}

function PatientList({
  patients,
  onUpdateList,
  hasNextPage,
  showEditButton = false,
}: Props) {
  const navigate = useNavigate()
  const [deleteErrMsg, setDeleteErrMsg] = useState<string | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>(undefined)

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    const res = await deletePatient(deleteTarget.providerSlug, deleteTarget.id)
    setIsDeleting(false)
    if (res.errMsg) {
      setDeleteErrMsg(res.errMsg)
      setDeleteTarget(null)
    } else {
      setDeleteTarget(null)
      onUpdateList()
    }
  }

  async function handlePatientSuccess() {
    setEditingPatient(undefined)
    onUpdateList()
  }

  return (
    <Box>
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Excluir Paciente"
        message={`Tem certeza que deseja excluir o paciente "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        errMsg={deleteErrMsg}
        onCancel={() => {setDeleteTarget(null); setDeleteErrMsg(undefined)}}
        isLoading={isDeleting}
      />
      {editingPatient && <PatientForm
        patient={editingPatient}
        onSuccess={handlePatientSuccess}
        onClose={() => setEditingPatient(undefined)}
      />}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Turno</TableCell>
              <TableCell>Criado em</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    Nenhum paciente ainda.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {patients.map(patient => (
              <TableRow key={patient.id}>
                <TableCell>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate(`/providers/${patient.providerSlug}/patients/${patient.id}`)}
                    sx={{ fontWeight: 600 }}
                  >
                    {patient.name}
                  </Link>
                </TableCell>
                <TableCell>{patient.description}</TableCell>
                <TableCell>{shiftLabel(patient.shift)}</TableCell>
                <TableCell>{new Date(patient.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} sx={{justifyContent: "flex-end"}}>
                    {showEditButton && (
                      <IconButton size="small" color="primary" onClick={() => setEditingPatient(patient)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(patient)}>
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

function shiftLabel(shift: string | null): string {
  if (shift === 'morning') return 'Manhã'
  if (shift === 'afternoon') return 'Tarde'
  if (shift === 'night') return 'Noite'
  return '—'
}

export default PatientList
