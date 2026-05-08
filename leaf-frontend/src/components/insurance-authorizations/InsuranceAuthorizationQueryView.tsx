import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import type { Insurance, InsuranceAuthorization, PagedResponse, Provider } from '../../models/Domain'
import { listProviders } from '../../services/providerService'
import { listInsurances } from '../../services/insuranceService'
import InsuranceAuthorizationList from './InsuranceAuthorizationList'
import QueryFilters, { type FilterItem } from '../QueryFilters';
import { useSearchParams } from 'react-router';
import { Alert, CircularProgress } from '@mui/material';
import { listInsuranceAuthorizations } from '../../services/listService';
import InsuranceAuthorizationCreateButton from './InsuranceAuthorizationCreateButton';

interface Props {
  providerSlug?: string
  patientId?: string
}

function InsuranceAuthorizationQueryView({ providerSlug, patientId }: Props) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [pagedData, setPagedData] = useState<PagedResponse<InsuranceAuthorization> | null>(null)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [insuranceAuthFilters, setFilters] = useState<FilterItem[]>([
    {queryParam: "remainingsessions_gt", displayName: "Sessões Restantes >", inputType: "number"},
    {queryParam: "remainingsessions_lt", displayName: "Sessões Restantes <", inputType: "number"},
    {queryParam: "expiresat_lt", displayName: "Expiração <", inputType: "datetime"},
    {queryParam: "expiresat_gt", displayName: "Expiração >", inputType: "datetime"},
    {queryParam: "order_by", displayName: "Ordenar Por", inputType: "dropdown", availableOptions: [
      {displayName: "Data de início", value: "start"},
      {displayName: "Sessões Restantes", value: "remainingsessions"}
    ]},
    {queryParam: "expired", displayName: "Expirada", inputType: "dropdown", availableOptions: [
      {value: "true", displayName: "Sim"},
      {value: "false", displayName: "Não"},
    ]},
    {queryParam: "aboutToExpire", displayName: "Prestes a Expirar", inputType: "dropdown", availableOptions: [
      {value: "true", displayName: "Sim"},
      {value: "false", displayName: "Não"},
    ]},
    {queryParam: "aboutToBeFull", displayName: "Prestes a Ficar Completa", inputType: "dropdown", availableOptions: [
      {value: "true", displayName: "Sim"},
      {value: "false", displayName: "Não"},
    ]},
  ])
  const [searchParams, _] = useSearchParams();

  useEffect(() => {
    let promises: Promise<any>[] = [listInsurances()]
    if (providerSlug === undefined) {
      promises.push(listProviders(1))
    }
    Promise.all(promises).then(res => {
      const newFilters = [ ...insuranceAuthFilters ]
      if (res[1]) {
        const providers = res[1].data.items as Provider[]
        newFilters.push({
          queryParam: "providerSlug",
          displayName: "Clínica",
          inputType: "dropdown",
          availableOptions: providers.map(p => { return {displayName: p.name, value: p.slug }})
        })
      }
      if (res[0]) {
        const insurances = res[0].data as Insurance[]
        newFilters.push({
          queryParam: "insuranceName",
          displayName: "Convênio",
          inputType: "dropdown",
          availableOptions: insurances.map(i => { return {displayName: i.name, value: i.name }})
        })
      }
      setFilters(newFilters)
    })
  }, [])

  useEffect(() => {
    listInsuranceAuthorizations(providerSlug, patientId, searchParams).then(res => {
      if (res.errMsg) setErrMsg(res.errMsg)
      else setPagedData(res.data!)
      setIsLoading(false)
    })
  }, [searchParams, refreshKey])

  return (
    <Box>
      {providerSlug && patientId && <InsuranceAuthorizationCreateButton providerSlug={providerSlug} patientId={patientId} onSuccess={() => setRefreshKey(k => k + 1)}/>}
      <QueryFilters filterItems={insuranceAuthFilters} />
      {!isLoading && pagedData?.items && <InsuranceAuthorizationList
        insuranceAuthorizations={pagedData?.items}
        showEditButton={true}
        onUpdateList={() => setRefreshKey(k => k + 1)}
        hasNextPage={pagedData.hasNextPage}
      />}
      {isLoading && <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Box>}
      {errMsg && <Alert severity="error">{errMsg}</Alert>}
    </Box>
  )
}

export default InsuranceAuthorizationQueryView
