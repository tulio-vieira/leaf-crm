import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import type { Board } from '../../models/Domain'
import type { PageState } from '../../models/PageState'
import { createBoard, updateBoard } from '../../services/boardService'

interface Props {
  board?: Board
  onSuccess: () => void
  onCancel: () => void
}

function BoardForm({ board, onSuccess, onCancel }: Props) {
  const isEdit = board !== undefined

  const [name, setName] = useState(board?.name ?? '')
  const [description, setDescription] = useState(board?.description ?? '')
  const [columns, setColumns] = useState<string[]>([''])

  const [formState, setFormState] = useState<PageState>({})

  function handleAddColumn() {
    setColumns(cols => [...cols, ''])
  }

  function handleRemoveColumn(idx: number) {
    setColumns(cols => cols.filter((_, i) => i !== idx))
  }

  function handleColumnChange(idx: number, value: string) {
    setColumns(cols => cols.map((col, i) => (i === idx ? value : col)))
  }

  const columnsValid = columns.length > 0 && columns.every(c => c.trim().length > 0)

  async function handleSubmit() {
    if (!name.trim()) return
    if (!isEdit && !columnsValid) return

    setFormState({ isLoading: true })

    const res = isEdit
      ? await updateBoard(board!.id, { name, description })
      : await createBoard({ name, description, columns: columns.map(c => ({ name: c.trim() })) })

    if (res.errMsg) {
      setFormState({ errMsg: res.errMsg })
    } else {
      setFormState({})
      onSuccess()
    }
  }

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar Quadro' : 'Novo Quadro'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {formState.errMsg && <Alert severity="error">{formState.errMsg}</Alert>}

          <TextField
            label="Nome"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            fullWidth
            disabled={formState.isLoading}
          />

          <TextField
            label="Descrição"
            value={description}
            onChange={e => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            disabled={formState.isLoading}
          />

          {!isEdit && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Colunas
              </Typography>
              <Stack spacing={1}>
                {columns.map((col, idx) => (
                  <Stack key={idx} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <TextField
                      label={`Coluna ${idx + 1}`}
                      value={col}
                      onChange={e => handleColumnChange(idx, e.target.value)}
                      required
                      fullWidth
                      size="small"
                      disabled={formState.isLoading}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveColumn(idx)}
                      disabled={columns.length === 1 || formState.isLoading}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
              <Button
                startIcon={<AddIcon />}
                size="small"
                onClick={handleAddColumn}
                disabled={formState.isLoading}
                sx={{ mt: 1 }}
              >
                Adicionar Coluna
              </Button>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={formState.isLoading}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={formState.isLoading || !name.trim() || (!isEdit && !columnsValid)}
        >
          {formState.isLoading ? <CircularProgress size={20} color="inherit" /> : isEdit ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BoardForm
