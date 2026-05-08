import { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import PatientForm from './PatientForm'

interface Props {
  providerSlug: string
  onSuccess: () => void
}

function PatientCreateButton({ providerSlug, onSuccess }: Props) {
  const [showForm, setShowForm] = useState(false)

  function handleSuccess() {
    setShowForm(false)
    onSuccess()
  }

  return (
    <>
      <Button sx={{mb: "1em"}} variant="contained" startIcon={<AddIcon />} onClick={() => setShowForm(true)}>
        Novo Paciente
      </Button>
      {showForm && (
        <PatientForm
          providerSlug={providerSlug}
          onSuccess={handleSuccess}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  )
}

export default PatientCreateButton
