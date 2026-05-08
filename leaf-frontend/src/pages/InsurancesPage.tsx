import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import type { Insurance } from '../models/Domain'
import { listInsurances } from '../services/insuranceService'
import InsuranceForm from '../components/InsuranceForm'
import InsuranceList from '../components/InsuranceList'
import PolicyIcon from '@mui/icons-material/Policy'

function InsurancesPage() {
  const [insurances, setInsurances] = useState<Insurance[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingInsurance, setEditingInsurance] = useState<Insurance | null>(null)

  function load() {
    setIsLoading(true)
    setErrMsg(null)
    listInsurances().then(res => {
      if (res.errMsg) setErrMsg(res.errMsg)
      else setInsurances(res.data!)
      setIsLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  function handleSuccess() {
    setShowForm(false)
    setEditingInsurance(null)
    load()
  }

  function handleCancel() {
    setShowForm(false)
    setEditingInsurance(null)
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}><PolicyIcon sx={{marginBottom: "-0.1em"}} /> Convênios</Typography>

      {(showForm || !!editingInsurance) && <InsuranceForm
        open
        insurance={editingInsurance ?? undefined}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />}

      <Box sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowForm(true)}>
          Novo Convênio
        </Button>
      </Box>

      {isLoading && <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Box>}
      {errMsg && <Alert severity="error">{errMsg}</Alert>}
      {!isLoading && !errMsg && (
        <InsuranceList
          insurances={insurances}
          onEditRequest={ins => { setEditingInsurance(ins); setShowForm(false) }}
          onDeleted={load}
        />
      )}
    </Box>
  )
}

export default InsurancesPage
