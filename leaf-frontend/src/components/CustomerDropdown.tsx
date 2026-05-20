import { useEffect, useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import type { CustomerOption } from '../models/Domain'
import { useDebounce } from '../hooks/useDebounce'
import { searchCustomers } from '../services/customerService'

interface Props {
  value: CustomerOption | null
  onChange: (customer: CustomerOption | null) => void
  disabled?: boolean
}

function CustomerDropdown({ value, onChange, disabled }: Props) {
  const [inputValue, setInputValue] = useState('')
  const [options, setOptions] = useState<CustomerOption[]>(value ? [value] : [])
  const [loading, setLoading] = useState(false)

  const debouncedInput = useDebounce(inputValue, 400)

  useEffect(() => {
    let active = true
    setLoading(true)
    searchCustomers(debouncedInput).then(res => {
      if (!active) return
      setOptions(res.data ?? [])
      setLoading(false)
    })
    return () => { active = false }
  }, [debouncedInput])

  return (
    <Autocomplete
      options={options}
      getOptionLabel={opt => opt.name}
      value={value}
      inputValue={inputValue}
      onInputChange={(_, val) => setInputValue(val)}
      onChange={(_, customer) => onChange(customer)}
      loading={loading}
      filterOptions={x => x}
      isOptionEqualToValue={(opt, val) => opt.id === val.id}
      disabled={disabled}
      renderInput={params => (
        <TextField {...params} label="Cliente" required />
      )}
    />
  )
}

export default CustomerDropdown
