import type { PagedResponse, TreatmentSession } from '../models/Domain'
import { backendAPI, type APIResponse } from './backendService'

const PAGE_SIZE = parseInt(import.meta.env.VITE_PAGE_SIZE ?? '20')

export async function listSessions(providerSlug: string, patientId: string, page: number = 1): Promise<APIResponse<PagedResponse<TreatmentSession>>> {
  try {
    const res = await backendAPI.get<PagedResponse<TreatmentSession>>(
      `providers/${providerSlug}/patients/${patientId}/treatment-sessions`,
      { page, pageSize: PAGE_SIZE }
    )
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function getSession(providerSlug: string, patientId: string, id: number): Promise<APIResponse<TreatmentSession>> {
  try {
    const res = await backendAPI.get<TreatmentSession>(
      `providers/${providerSlug}/patients/${patientId}/treatment-sessions/${id}`
    )
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function createSession(providerSlug: string, patientId: string, data: {
  name: string
  insuranceAuthorizationId?: number
  description: string
  paymentReceived: boolean
  priceCents?: number
  start: string
  end: string
}): Promise<APIResponse<TreatmentSession>> {
  try {
    const res = await backendAPI.post<TreatmentSession>(
      `providers/${providerSlug}/patients/${patientId}/treatment-sessions`,
      {
        ...data,
        start: new Date(data.start).toISOString(),
        end: new Date(data.end).toISOString(),
      }
    )
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function deleteSession(providerSlug: string, patientId: string, id: number): Promise<APIResponse<void>> {
  try {
    await backendAPI.delete(
      `providers/${providerSlug}/patients/${patientId}/treatment-sessions/${id}`
    )
    return {}
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function updateSession(providerSlug: string, patientId: string, id: number, data: {
  name?: string
  insuranceAuthorizationId?: number
  description?: string
  paymentReceived?: boolean
  priceCents?: number
  start?: string
  end?: string
}): Promise<APIResponse<TreatmentSession>> {
  try {
    const res = await backendAPI.put<TreatmentSession>(
      `providers/${providerSlug}/patients/${patientId}/treatment-sessions/${id}`,
      {
        ...data,
        ...(data.start !== undefined && { start: new Date(data.start).toISOString() }),
        ...(data.end !== undefined && { end: new Date(data.end).toISOString() }),
      }
    )
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}
