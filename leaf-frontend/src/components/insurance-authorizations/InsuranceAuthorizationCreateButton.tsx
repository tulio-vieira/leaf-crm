import { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import InsuranceAuthorizationForm from './InsuranceAuthorizationForm'

interface Props {
  providerSlug: string
  patientId: string
  onSuccess: () => void
}

function InsuranceAuthorizationCreateButton({ providerSlug, patientId, onSuccess }: Props) {
  const [showForm, setShowForm] = useState(false)

  function handleSuccess() {
    setShowForm(false)
    onSuccess()
  }

  return (
    <>
      <Button sx={{mb: "1em"}} variant="contained" startIcon={<AddIcon />} onClick={() => setShowForm(true)}>
        Nova Autorização de Convênio
      </Button>
      {showForm && (
        <InsuranceAuthorizationForm
          providerSlug={providerSlug}
          patientId={patientId}
          onSuccess={handleSuccess}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  )
}

export default InsuranceAuthorizationCreateButton
