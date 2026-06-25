import { useEffect, useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import type { UserOption } from '../models/Domain'
import { useDebounce } from '../hooks/useDebounce'
import { searchUsers } from '../services/userService'
import type { PageState } from '../models/PageState';

interface Props {
  value: UserOption | null
  onChange: (user: UserOption | null) => void
  disabled?: boolean
}

function UserDropdown({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value?.name || "")
  const [options, setOptions] = useState<PageState<UserOption[]>>({data: value ? [value] : []})

  const debouncedInput = useDebounce(inputValue, 400)

  useEffect(() => {
    if (!open) return
    let active = true
    setOptions({isLoading: true})
    searchUsers(debouncedInput === value?.name ? "" : debouncedInput).then(res => {
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
      onChange={(_, user) => onChange(user)}
      loading={options.isLoading}
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
