import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ConfirmDialog from '../components/ConfirmDialog'
import LeadForm from '../components/Lead/LeadForm'
import type { Lead } from '../models/Domain'
import type { PageState } from '../models/PageState'
import { getLead, deleteLead } from '../services/leadService'

function LeadDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [leadState, setLeadState] = useState<PageState<Lead>>({ isLoading: true })
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteState, setDeleteState] = useState<PageState>({})

  async function fetchLead() {
    setLeadState({ isLoading: true })
    const res = await getLead(Number(id))
    if (res.errMsg) setLeadState({ errMsg: res.errMsg })
    else setLeadState({ data: res.data })
  }

  useEffect(() => { fetchLead() }, [id])

  async function handleDelete() {
    setDeleteState({ isLoading: true })
    const res = await deleteLead(Number(id))
    if (res.errMsg) {
      setDeleteState({ errMsg: res.errMsg })
    } else {
      navigate('/leads')
    }
  }

  const lead = leadState.data

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/leads')}
        sx={{ mb: 2 }}
      >
        Voltar aos Leads
      </Button>

      {leadState.isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {leadState.errMsg && <Alert severity="error">{leadState.errMsg}</Alert>}

      {lead && (
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{lead.name}</Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setShowEditForm(true)}
              >
                Editar
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setShowDelete(true)}
              >
                Excluir
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Stack spacing={1.5}>
            <Box>
              <Typography variant="caption" color="text.secondary">Descrição</Typography>
              <Typography variant="body1">{lead.description || '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Quadro</Typography>
              <Typography variant="body1">{lead.board?.name ?? lead.boardId}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Coluna</Typography>
              <Typography variant="body1">
                {lead.board?.columns[lead.columnIdx]?.name ?? `Coluna ${lead.columnIdx}`}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Criado em</Typography>
              <Typography variant="body1">
                {new Date(lead.createdAt).toLocaleString('pt-BR')}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Última modificação</Typography>
              <Typography variant="body1">
                {new Date(lead.modifiedAt).toLocaleString('pt-BR')}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Alterado por</Typography>
              <Typography variant="body1">{lead.changedBy || '—'}</Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      {showEditForm && lead && (
        <LeadForm
          lead={lead}
          onSuccess={() => { setShowEditForm(false); fetchLead() }}
          onCancel={() => setShowEditForm(false)}
        />
      )}

      <ConfirmDialog
        open={showDelete}
        title="Excluir Lead"
        message={`Deseja excluir o lead "${lead?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        onCancel={() => { setShowDelete(false); setDeleteState({}) }}
        isLoading={deleteState.isLoading}
        errMsg={deleteState.errMsg}
      />
    </Box>
  )
}

export default LeadDetail
