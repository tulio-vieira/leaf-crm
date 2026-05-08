import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ViewListIcon from '@mui/icons-material/ViewList'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import type { PagedResponse, TreatmentSession } from '../../models/Domain'
import { listProviders } from '../../services/providerService'
import { listInsuranceAuthorizations, listTreatmentSessions } from '../../services/listService'
import TreatmentSessionList from './TreatmentSessionList'
import TreatmentSessionCalendar, { type CalendarView } from './TreatmentSessionCalendar'
import type { FilterItem } from '../QueryFilters';
import { useSearchParams } from 'react-router';
import QueryFilters from '../QueryFilters';
import TreatmentSessionCreateButton from './TreatmentSessionCreateButton';

interface Props {
  enableCalendar: boolean
  providerSlug?: string
  patientId?: string
  insuranceAuthorizationId?: string
}

function TreatmentSessionQueryView({
  providerSlug,
  patientId,
  insuranceAuthorizationId,
  enableCalendar = false
}: Props) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [pagedData, setPagedData] = useState<PagedResponse<TreatmentSession> | null>(null)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterItem[]>([
    {queryParam: "paymentReceived", displayName: "Pagamento recebido", inputType: "dropdown", availableOptions: [
      {value: "true", displayName: "Sim"},
      {value: "false", displayName: "Não"},
    ]},
    {queryParam: "hasAuthorization", displayName: "Com Convênio", inputType: "dropdown", availableOptions: [
      {value: "true", displayName: "Sim"},
      {value: "false", displayName: "Não"},
    ]},
    {queryParam: "start_lt", displayName: "Data <", inputType: "datetime"},
    {queryParam: "start_gt", displayName: "Data >", inputType: "datetime"},
  ])

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const newFilters = [ ...filters ]
    if (providerSlug === undefined) {
      listProviders(1).then(res => {
        newFilters.push({
          queryParam: "providerSlug",
          displayName: "Clínica",
          inputType: "dropdown",
          availableOptions: res.data?.items.map(p => { return {displayName: p.name, value: p.slug }})
        })
        setFilters(newFilters)
      })
    } else if (patientId !== undefined) {
      listInsuranceAuthorizations(providerSlug, patientId).then(res => {
        newFilters.push({
          queryParam: "insuranceAuthorizationId",
          displayName: "Autorização de Convênio",
          inputType: "dropdown",
          availableOptions: res.data?.items.map(a => { return {displayName: a.name, value: a.id }})
        })
        setFilters(newFilters)
      })
    }
  }, [])

  useEffect(() => {
    setErrMsg(null)
    setIsLoading(true)
    listTreatmentSessions(providerSlug, patientId, insuranceAuthorizationId, searchParams).then(res => {
      if (res.errMsg) setErrMsg(res.errMsg)
      else setPagedData(res.data!)
      setIsLoading(false)
    })
  }, [providerSlug, patientId, searchParams, insuranceAuthorizationId, refreshKey])

  let view = "list"
  if (enableCalendar && searchParams.get("view") !== null && searchParams.get("view") !== "list" ) {
    view = searchParams.get("view") as string
  }

 function handleView(_: React.MouseEvent, newMode: 'list' | CalendarView | null) {
    if (!newMode) return
    const newSearchParams = new URLSearchParams()
    newSearchParams.set("view", newMode)
    setSearchParams(newSearchParams)
  }

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', alignItems: 'flex-end', marginBottom:"1em" }}>
        {providerSlug && patientId && <TreatmentSessionCreateButton providerSlug={providerSlug} patientId={patientId} onSuccess={() => setRefreshKey(k => k + 1)}/>}
        {enableCalendar && <div style={{marginLeft: "auto"}}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleView}
            size="small"
          >
            <ToggleButton value="list"><ViewListIcon fontSize="small" /></ToggleButton>
            <ToggleButton value="month"><CalendarMonthIcon fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
        </div>}
      </Stack>
      {view === 'list' && <QueryFilters filterItems={filters} />}

      {isLoading && <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Box>}
      {errMsg && <Alert severity="error">{errMsg}</Alert>}

      {view !== 'list' && providerSlug && patientId && pagedData?.items && (
        <TreatmentSessionCalendar
          sessions={pagedData.items}
          providerSlug={providerSlug}
          patientId={patientId}
          allowWrites
          enabled={!isLoading}
          onUpdateList={() => setRefreshKey(k => k + 1)}
        />
      )}
      {view === 'list' && pagedData?.items && <TreatmentSessionList
        sessions={pagedData.items}
        showEditButton
        onUpdateList={() => setRefreshKey(k => k + 1)}
        hasNextPage={pagedData.hasNextPage}
      />}
    </Box>
  )
}

export default TreatmentSessionQueryView
