import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useSearchParams } from 'react-router';

type InputType = 'dropdown' | 'string' | 'number' | 'datetime'

export interface DropdownOption {
  displayName: string
  value: string | number
}

export interface FilterItem {
  queryParam: string
  inputType: InputType
  availableOptions?: DropdownOption[]
  displayName: string
}

interface AppliedFilter {
  queryParam: string
  rawValue: string
  chipLabel: string
}

function toLocalISOString(localDatetimeStr: string): string {
  const offsetMinutes = -new Date(localDatetimeStr).getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const hh = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0')
  const mm = String(Math.abs(offsetMinutes) % 60).padStart(2, '0')
  return `${localDatetimeStr}:00${sign}${hh}:${mm}`
}

function parseInitialFilters(searchParams: URLSearchParams, filterItems: FilterItem[]): AppliedFilter[] {
  if (searchParams.size === 0) return []
  const itemsByParam: Record<string, FilterItem> = {}
  filterItems.forEach(item => { itemsByParam[item.queryParam] = item })
  const result: AppliedFilter[] = []
  searchParams.forEach((value, key) => {
    const item = itemsByParam[key]
    if (!item) return
    let humanValue = value
    if (item.inputType === 'dropdown' && item.availableOptions) {
      const optionsByValue: Record<string, string> = {}
      item.availableOptions.forEach(o => { optionsByValue[String(o.value)] = o.displayName })
      humanValue = optionsByValue[value] ?? value
    }
    result.push({ queryParam: key, rawValue: value, chipLabel: `${item.displayName}: ${humanValue}` })
  })
  return result
}

interface Props {
  filterItems: FilterItem[]
}

function QueryFilters({ filterItems }: Props) {
  const [selectedParam, setSelectedParam] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [searchParams, setSearchParams] = useSearchParams();
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilter[]>(() => {
    return parseInitialFilters(searchParams, filterItems)
  })

  const selectedItem = filterItems.find(f => f.queryParam === selectedParam) ?? null

  if (selectedItem?.inputType === 'dropdown' && !selectedItem.availableOptions) {
    throw new Error(`FilterItem "${selectedItem.queryParam}" has inputType "dropdown" but no availableOptions defined.`)
  }

  function handleApply() {
    if (!selectedItem || inputValue === '') return

    let rawValue: string
    let humanValue: string

    if (selectedItem.inputType === 'dropdown') {
      const option = selectedItem.availableOptions!.find(o => String(o.value) === inputValue)
      rawValue = inputValue
      humanValue = option?.displayName ?? inputValue
    } else if (selectedItem.inputType === 'datetime') {
      rawValue = toLocalISOString(inputValue)
      humanValue = new Date(inputValue).toLocaleString('pt-BR')
    } else {
      rawValue = inputValue
      humanValue = inputValue
    }

    const chipLabel = `${selectedItem.displayName}: ${humanValue}`
    const newFilter: AppliedFilter = { queryParam: selectedItem.queryParam, rawValue, chipLabel }

    let newFilters
    
    if (appliedFilters.some(f => f.queryParam === selectedItem.queryParam)) {
      newFilters = appliedFilters.map(f => f.queryParam === selectedItem.queryParam ? newFilter : f)
      searchParams.set(newFilter.queryParam, newFilter.rawValue)
    } else {
      searchParams.append(newFilter.queryParam, newFilter.rawValue)
      newFilters = [...appliedFilters, newFilter]
    }

    setAppliedFilters(newFilters)
    setSelectedParam('')
    setInputValue('')
    searchParams.delete("page")
    setSearchParams(new URLSearchParams(searchParams))
  }

  function handleDelete(queryParam: string) {
    const newFilters = appliedFilters.filter(f => f.queryParam !== queryParam)
    setAppliedFilters(newFilters)
    searchParams.delete(queryParam)
    searchParams.delete("page")
    setSearchParams(new URLSearchParams(searchParams))
  }

  function handleSelectFilter(param: string) {
    setSelectedParam(param)
    setInputValue('')
  }

  return (
    <Box sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Filtros</Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'flex-end', mb: appliedFilters.length > 0 ? 1 : 0 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Selecionar filtro</InputLabel>
          <Select
            value={selectedParam}
            label="Selecionar filtro"
            onChange={e => handleSelectFilter(e.target.value)}
          >
            <MenuItem value=""><em>—</em></MenuItem>
            {filterItems.map(item => (
              <MenuItem key={item.queryParam} value={item.queryParam}>{item.displayName}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedItem && selectedItem.inputType === 'string' && (
          <TextField
            size="small"
            label={selectedItem.displayName}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            sx={{ minWidth: 180 }}
          />
        )}

        {selectedItem && selectedItem.inputType === 'number' && (
          <TextField
            size="small"
            type="number"
            label={selectedItem.displayName}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            sx={{ minWidth: 140 }}
          />
        )}

        {selectedItem && selectedItem.inputType === 'datetime' && (
          <TextField
            size="small"
            type="datetime-local"
            label={selectedItem.displayName}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        )}

        {selectedItem && selectedItem.inputType === 'dropdown' && (
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>{selectedItem.displayName}</InputLabel>
            <Select
              value={inputValue}
              label={selectedItem.displayName}
              onChange={e => setInputValue(e.target.value)}
            >
              {selectedItem.availableOptions!.map(opt => (
                <MenuItem key={String(opt.value)} value={String(opt.value)}>{opt.displayName}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {selectedItem && (
          <Button variant="contained" size="small" onClick={handleApply} disabled={inputValue === ''}>
            Aplicar
          </Button>
        )}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mt: 1 }}>
        {appliedFilters.length > 0 ? <>
          {appliedFilters.map(f => (
            <Chip
              key={f.queryParam}
              label={f.chipLabel}
              variant="outlined"
              size="small"
              onDelete={() => handleDelete(f.queryParam)}
            />
          ))}
        </> : <Chip variant="outlined" size="small" label="" sx={{visibility: "hidden"}}/>}  
      </Stack>
    </Box>
  )
}

export default QueryFilters
