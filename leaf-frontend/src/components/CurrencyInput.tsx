import { useState, useEffect } from 'react'
import TextField from '@mui/material/TextField'
import type { TextFieldProps } from '@mui/material/TextField'
import { formatBRL, parseBRLToCents } from '../util/currency'

type Props = Omit<TextFieldProps, 'value' | 'onChange'> & {
  value: number | ''
  onChange: (cents: number | '') => void
}

function CurrencyInput({ value, onChange, ...textFieldProps }: Props) {
  const [display, setDisplay] = useState(value !== '' ? formatBRL(value) : '')

  useEffect(() => {
    setDisplay(value !== '' ? formatBRL(value) : '')
  }, [value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDisplay(e.target.value)
  }

  function handleBlur() {
    if (display === '') {
      onChange('')
      return
    }
    const cents = parseBRLToCents(display)
    if (isNaN(cents)) {
      setDisplay(value !== '' ? formatBRL(value) : '')
    } else {
      onChange(cents)
      setDisplay(formatBRL(cents))
    }
  }

  return (
    <TextField
      {...textFieldProps}
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="R$ 0,00"
    />
  )
}

export default CurrencyInput
