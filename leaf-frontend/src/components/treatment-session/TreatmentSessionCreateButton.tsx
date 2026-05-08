import { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import TreatmentSessionForm from './TreatmentSessionForm'

interface Props {
  providerSlug: string
  patientId: string
  onSuccess: () => void
}

function TreatmentSessionCreateButton({ providerSlug, patientId, onSuccess }: Props) {
  const [showForm, setShowForm] = useState(false)

  function handleSuccess() {
    setShowForm(false)
    onSuccess()
  }

  return (
    <>
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowForm(true)}>
        Novo Agendamento
      </Button>
      {showForm && (
        <TreatmentSessionForm
          providerSlug={providerSlug}
          patientId={patientId}
          onSuccess={handleSuccess}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  )
}

export default TreatmentSessionCreateButton
