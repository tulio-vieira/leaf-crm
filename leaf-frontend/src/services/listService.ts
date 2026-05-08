import type { InsuranceAuthorization, Notification, PagedResponse, Patient, TreatmentSession } from '../models/Domain'
import { backendAPI, type APIResponse } from './backendService'

// const PAGE_SIZE = parseInt(import.meta.env.VITE_PAGE_SIZE ?? '20')

export async function listPatients(providerSlug?: string, params = new URLSearchParams): Promise<APIResponse<PagedResponse<Patient>>> {
  try {
    if (providerSlug) {
      params?.set("providerSlug", providerSlug)
    }
    const res = await backendAPI.get<PagedResponse<Patient>>('list/patients', params)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function listInsuranceAuthorizations(providerSlug?: string, patientId?: string, params = new URLSearchParams): Promise<APIResponse<PagedResponse<InsuranceAuthorization>>> {
  try {
    if (providerSlug) {
      params?.set("providerSlug", providerSlug)
    }
    if (patientId) {
      params?.set("patientId", patientId)
    }
    const res = await backendAPI.get<PagedResponse<InsuranceAuthorization>>('list/insurance-authorizations', params)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function listAllNotifications(params = new URLSearchParams()): Promise<APIResponse<PagedResponse<Notification>>> {
  try {
    const res = await backendAPI.get<PagedResponse<Notification>>('list/notifications', params)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function listTreatmentSessions(providerSlug?: string, patientId?: string, insuranceAuthorizationId?: string, params = new URLSearchParams): Promise<APIResponse<PagedResponse<TreatmentSession>>> {
  try {
    if (providerSlug) params?.set("providerSlug", providerSlug)
    if (patientId) params?.set("patientId", patientId)
    if (insuranceAuthorizationId) params?.set("insuranceAuthorizationId", insuranceAuthorizationId)
    const res = await backendAPI.get<PagedResponse<TreatmentSession>>('list/treatment-sessions', params)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}
