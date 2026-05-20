import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import QueryFilters, { type FilterItem } from '../components/QueryFilters'
import CustomerList from '../components/Customer/CustomerList'
import CustomerForm from '../components/Customer/CustomerForm'
import type { Customer, PagedResponse } from '../models/Domain'
import type { PageState } from '../models/PageState'
import { listCustomers } from '../services/customerService'

const filterItems: FilterItem[] = [
  { queryParam: 'name', inputType: 'string', displayName: 'Nome' },
]

function CustomerScreen() {
  const [searchParams] = useSearchParams()
  const [customersState, setCustomersState] = useState<PageState<PagedResponse<Customer>>>({ isLoading: true })
  const [refreshKey, setRefreshKey] = useState(0)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    setCustomersState({ isLoading: true })
    const page = parseInt(searchParams.get('page') ?? '1')
    const name = searchParams.get('name') ?? undefined
    listCustomers({ page, name }).then(res => {
      if (res.errMsg) setCustomersState({ errMsg: res.errMsg })
      else setCustomersState({ data: res.data })
    })
  }, [searchParams, refreshKey])

  function handleChanged() {
    setRefreshKey(k => k + 1)
  }

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Clientes</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateForm(true)}
        >
          Novo Cliente
        </Button>
      </Stack>

      <QueryFilters filterItems={filterItems} />

      {customersState.isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {customersState.errMsg && <Alert severity="error">{customersState.errMsg}</Alert>}
      {customersState.data && (
        <CustomerList
          customers={customersState.data.items}
          hasNextPage={customersState.data.hasNextPage}
          onChanged={handleChanged}
        />
      )}

      {showCreateForm && (
        <CustomerForm
          onSuccess={() => { setShowCreateForm(false); handleChanged() }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </Box>
  )
}

export default CustomerScreen
