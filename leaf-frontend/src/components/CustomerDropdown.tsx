import { useEffect, useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import type { CustomerOption } from '../models/Domain'
import { useDebounce } from '../hooks/useDebounce'
import { searchCustomers } from '../services/customerService'
import type { PageState } from '../models/PageState';

interface Props {
  value: CustomerOption | null
  onChange: (customer: CustomerOption | null) => void
  disabled?: boolean
}

function CustomerDropdown({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value?.name || '')
  const [options, setOptions] = useState<PageState<CustomerOption[]>>({data: value ? [value] : []})

  const debouncedInput = useDebounce(inputValue, 400)

  useEffect(() => {
    if (!open) return
    let active = true
    setOptions({isLoading: true})
    searchCustomers(debouncedInput === value?.name ? "" : debouncedInput).then(res => {
      if (!active) return
      setOptions(res)
    })
    return () => { active = false }
  }, [debouncedInput, open])

  return (
    <Autocomplete
      onOpen={() => setOpen(true)}
      options={options.data ? options.data : []}
      getOptionLabel={opt => opt.name}
      value={value}
      inputValue={inputValue}
      onInputChange={(_, val) => setInputValue(val)}
      onChange={(_, customer) => onChange(customer)}
      loading={options.isLoading}
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
