import { useEffect, useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import type { Board } from '../models/Domain'
import { listAllBoards } from '../services/boardService'
import type { PageState } from '../models/PageState';

interface Props {
  value: Board | null
  onChange: (board: Board | null) => void
  disabled?: boolean
}

function BoardDropdown({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<PageState<Board[]>>({data: value ? [value]: []})

  useEffect(() => {
    if (!open) return
    setOptions({isLoading: true})
    listAllBoards().then(res => {
      setOptions(res)
    })
  }, [open])

  return (
    <Autocomplete
      onOpen={() => setOpen(true)}
      options={options.data ? options.data : []}
      getOptionLabel={opt => opt.name}
      value={value}
      onChange={(_, board) => onChange(board)}
      loading={options.isLoading}
      isOptionEqualToValue={(opt, val) => opt.id === val.id}
      disabled={disabled}
      renderInput={params => (
        <TextField {...params} label="Quadro" required />
      )}
    />
  )
}

export default BoardDropdown
