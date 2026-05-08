import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import NotificationsIcon from '@mui/icons-material/Notifications'
import type { Provider } from '../models/Domain'
import { listProviders } from '../services/providerService'
import NotificationList from '../components/NotificationList'
import QueryFilters, { type FilterItem } from '../components/QueryFilters'

function NotificationsScreen() {
  const [providers, setProviders] = useState<Provider[]>([])

  useEffect(() => {
    listProviders(1).then(res => {
      if (res.data) setProviders(res.data.items)
    })
  }, [])

  const filterItems: FilterItem[] = [
    {
      queryParam: 'providerSlug',
      inputType: 'dropdown',
      displayName: 'Clínica',
      availableOptions: providers.map(p => ({ displayName: p.name, value: p.slug })),
    },
    {
      queryParam: 'acknowledged',
      inputType: 'dropdown',
      displayName: 'Status',
      availableOptions: [
        { displayName: 'Confirmada', value: 'true' },
        { displayName: 'Não lida', value: 'false' },
      ],
    },
    {
      queryParam: 'createdat_gt',
      inputType: 'datetime',
      displayName: 'Data a partir de',
    },
    {
      queryParam: 'createdat_lt',
      inputType: 'datetime',
      displayName: 'Data até',
    },
  ]

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}><NotificationsIcon sx={{ marginBottom: '-0.1em' }} /> Notificações</Typography>
      <QueryFilters filterItems={filterItems} />
      <NotificationList />
    </Box>
  )
}

export default NotificationsScreen
