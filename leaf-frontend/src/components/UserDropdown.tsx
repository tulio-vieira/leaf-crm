import { useEffect, useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import type { UserOption } from '../models/Domain'
import { useDebounce } from '../hooks/useDebounce'
import { searchUsers } from '../services/userService'

interface Props {
  value: UserOption | null
  onChange: (user: UserOption | null) => void
  disabled?: boolean
}

function UserDropdown({ value, onChange, disabled }: Props) {
  const [inputValue, setInputValue] = useState('')
  const [options, setOptions] = useState<UserOption[]>(value ? [value] : [])
  const [loading, setLoading] = useState(false)

  const debouncedInput = useDebounce(inputValue, 400)

  useEffect(() => {
    let active = true
    setLoading(true)
    searchUsers(debouncedInput).then(res => {
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
      onChange={(_, user) => onChange(user)}
      loading={loading}
      filterOptions={x => x}
      isOptionEqualToValue={(opt, val) => opt.id === val.id}
      disabled={disabled}
      renderInput={params => (
        <TextField {...params} label="Responsável" />
      )}
    />
  )
}

export default UserDropdown
