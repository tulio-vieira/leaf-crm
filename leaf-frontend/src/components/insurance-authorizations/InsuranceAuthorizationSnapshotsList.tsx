import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import type { InsuranceAuthorizationSnapshot, PagedResponse } from '../../models/Domain'
import { listAuthorizationSnapshots } from '../../services/insuranceAuthorizationService'
import { formatBRL } from '../../util/currency'
import PageSwitcher from '../PageSwitcher'

interface Props {
  providerSlug: string
  patientId: string
  insuranceAuthorizationId: string
}

function InsuranceAuthorizationSnapshotsList({ providerSlug, patientId, insuranceAuthorizationId }: Props) {
  const [searchParams] = useSearchParams()
  const pageNumber = parseInt(searchParams.get('page') ?? '1') || 1

  const [pagedData, setPagedData] = useState<PagedResponse<InsuranceAuthorizationSnapshot> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setErrMsg(null)
    listAuthorizationSnapshots(providerSlug, patientId, insuranceAuthorizationId, pageNumber).then(res => {
      if (res.errMsg) setErrMsg(res.errMsg)
      else setPagedData(res.data!)
      setIsLoading(false)
    })
  }, [providerSlug, patientId, insuranceAuthorizationId, pageNumber])

  if (isLoading) return <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Box>
  if (errMsg) return <Alert severity="error">{errMsg}</Alert>
  if (!pagedData) return null

  return (
    <Box>
      {pagedData.items.length === 0 ? (
        <Typography color="text.secondary">Nenhum snapshot registrado.</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Sessões</TableCell>
                <TableCell>Preço</TableCell>
                <TableCell>Pago</TableCell>
                <TableCell>Expira</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedData.items.map(snapshot => (
                <TableRow key={snapshot.id}>
                  <TableCell>{new Date(snapshot.createdAt).toLocaleString('pt-BR')}</TableCell>
                  <TableCell>{snapshot.name}</TableCell>
                  <TableCell>{snapshot.authorizedSessionCount}</TableCell>
                  <TableCell>{formatBRL(snapshot.priceCents)}</TableCell>
                  <TableCell>{snapshot.paymentReceived ? 'Sim' : 'Não'}</TableCell>
                  <TableCell>{new Date(snapshot.expiresAt).toLocaleDateString('pt-BR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <PageSwitcher hasNextPage={pagedData.hasNextPage} />
    </Box>
  )
}

export default InsuranceAuthorizationSnapshotsList
