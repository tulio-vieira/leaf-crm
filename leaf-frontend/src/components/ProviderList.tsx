import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
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
import type { PagedResponse, Provider } from '../models/Domain'
import { deleteProvider, listProviders } from '../services/providerService'

interface Props {
  refreshKey?: number
  onDeleted?: () => void
}

function ProviderList({ refreshKey, onDeleted }: Props) {
  const navigate = useNavigate()
  const [pagedData, setPagedData] = useState<PagedResponse<Provider> | null>(null)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  useEffect(() => { setPage(1) }, [refreshKey])

  useEffect(() => {
    setIsLoading(true)
    setErrMsg(null)
    listProviders(page).then(res => {
      if (res.errMsg) setErrMsg(res.errMsg)
      else setPagedData(res.data!)
      setIsLoading(false)
    })
  }, [page, refreshKey])

  async function handleDelete(slug: string) {
    const res = await deleteProvider(slug)
    if (res.errMsg) {
      setErrMsg(res.errMsg)
    } else {
      const res2 = await listProviders(page)
      if (res2.data) setPagedData(res2.data)
      onDeleted?.()
    }
  }

  if (isLoading) return <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Box>
  if (errMsg) return <Alert severity="error">{errMsg}</Alert>
  if (!pagedData) return null

  return (
    <Box>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Criado em</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedData.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    Nenhuma clínica ainda.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {pagedData.items.map(provider => (
              <TableRow key={provider.slug}>
                <TableCell>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate(`/providers/${provider.slug}`)}
                    sx={{ fontWeight: 600 }}
                  >
                    {provider.name}
                  </Link>
                </TableCell>
                <TableCell>{provider.slug}</TableCell>
                <TableCell>{new Date(provider.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => handleDelete(provider.slug)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: 'center' }}>
        <Button size="small" variant="outlined" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
          Anterior
        </Button>
        <Typography variant="body2">Página {pagedData.page}</Typography>
        <Button size="small" variant="outlined" disabled={!pagedData.hasNextPage} onClick={() => setPage(p => p + 1)}>
          Próxima
        </Button>
      </Stack>
    </Box>
  )
}

export default ProviderList
