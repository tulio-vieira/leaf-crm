import type { InsuranceAuthorization, InsuranceAuthorizationRequest, InsuranceAuthorizationSnapshot, PagedResponse } from '../models/Domain'
import { backendAPI, type APIResponse } from './backendService'

const PAGE_SIZE = parseInt(import.meta.env.VITE_PAGE_SIZE ?? '20')

export async function listAuthorizations(providerSlug: string, patientId: string, page: number = 1): Promise<APIResponse<PagedResponse<InsuranceAuthorization>>> {
  try {
    const res = await backendAPI.get<PagedResponse<InsuranceAuthorization>>(
      `providers/${providerSlug}/patients/${patientId}/insurance-authorizations`,
      { page, pageSize: PAGE_SIZE }
    )
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function getAuthorization(providerSlug: string, patientId: string, id: number): Promise<APIResponse<InsuranceAuthorization>> {
  try {
    const res = await backendAPI.get<InsuranceAuthorization>(
      `providers/${providerSlug}/patients/${patientId}/insurance-authorizations/${id}`
    )
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function createAuthorization(providerSlug: string, patientId: string, insuranceAuthRequest: InsuranceAuthorizationRequest): Promise<APIResponse<InsuranceAuthorization>> {
  try {
    const res = await backendAPI.post<InsuranceAuthorization>(
      `providers/${providerSlug}/patients/${patientId}/insurance-authorizations`,
      { ...insuranceAuthRequest, expiresAt: new Date(insuranceAuthRequest.expiresAt).toISOString() }
    )
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function updateAuthorization(providerSlug: string, patientId: number, id: number, insuranceAuthRequest: InsuranceAuthorizationRequest): Promise<APIResponse<InsuranceAuthorization>> {
  try {
    const res = await backendAPI.put<InsuranceAuthorization>(
      `providers/${providerSlug}/patients/${patientId}/insurance-authorizations/${id}`,
      {
        ...insuranceAuthRequest,
        expiresAt: new Date(insuranceAuthRequest.expiresAt).toISOString(),
      }
    )
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function deleteAuthorization(providerSlug: string, patientId: number, id: number): Promise<APIResponse<void>> {
  try {
    await backendAPI.delete(
      `providers/${providerSlug}/patients/${patientId}/insurance-authorizations/${id}`
    )
    return {}
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function listAuthorizationSnapshots(providerSlug: string, patientId: string, authorizationId: string, page: number = 1): Promise<APIResponse<PagedResponse<InsuranceAuthorizationSnapshot>>> {
  try {
    const res = await backendAPI.get<PagedResponse<InsuranceAuthorizationSnapshot>>(
      `providers/${providerSlug}/patients/${patientId}/insurance-authorizations/${authorizationId}/history`,
      { page, pageSize: PAGE_SIZE }
    )
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}
