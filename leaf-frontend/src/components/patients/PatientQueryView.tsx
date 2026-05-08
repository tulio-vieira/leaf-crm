import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import type { PagedResponse, Patient } from '../../models/Domain'
import { listProviders } from '../../services/providerService'
import PatientList from './PatientList'
import QueryFilters, { type FilterItem } from '../QueryFilters';
import { listPatients } from '../../services/listService';
import { useSearchParams } from 'react-router';
import { Alert, CircularProgress } from '@mui/material';
import PatientCreateButton from './PatientCreateButton';

interface Props {
  providerSlug?: string
}

function PatientQueryView({ providerSlug }: Props) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [pagedData, setPagedData] = useState<PagedResponse<Patient> | null>(null)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [patientFilters, setFilters] = useState<FilterItem[]>([
    {queryParam: "name", displayName: "Nome", inputType: "string"},
    {queryParam: "shift", displayName: "Turno", inputType: "dropdown", availableOptions: [
      {displayName: "Manhã", value: "morning"},
      {displayName: "Tarde", value: "afternoon"},
      {displayName: "Noite", value: "night"},
    ]}
  ])
  const [searchParams, _] = useSearchParams();

  useEffect(() => {
    if (providerSlug !== undefined) return
    listProviders(1).then(res => {
      if (res.data) {
        setFilters([
          ...patientFilters,
          {
            queryParam: "providerSlug",
            displayName: "Clínica",
            inputType: "dropdown",
            availableOptions: res.data.items.map(p => { return {displayName: p.name, value: p.slug }})
          }
        ])
      }
    })
  }, [])

  useEffect(() => {
    listPatients(providerSlug, searchParams).then(res => {
      if (res.errMsg) setErrMsg(res.errMsg)
      else setPagedData(res.data!)
      setIsLoading(false)
    })
  }, [searchParams, refreshKey])

  return (
    <Box>
      {providerSlug && <PatientCreateButton providerSlug={providerSlug} onSuccess={() => setRefreshKey(k => k + 1)}/>}
      <QueryFilters filterItems={patientFilters} />
      {!isLoading && pagedData?.items && <PatientList
        patients={pagedData?.items}
        showEditButton
        onUpdateList={() => setRefreshKey(k => k + 1)}
        hasNextPage={pagedData.hasNextPage}
      />}
      {isLoading && <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Box>}
      {errMsg && <Alert severity="error">{errMsg}</Alert>}
    </Box>
  )
}

export default PatientQueryView
