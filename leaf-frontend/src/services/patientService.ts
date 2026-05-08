import type { Patient } from '../models/Domain'
import { backendAPI, type APIResponse } from './backendService'

export async function getPatient(providerSlug: string, id: number): Promise<APIResponse<Patient>> {
  try {
    const res = await backendAPI.get<Patient>(`providers/${providerSlug}/patients/${id}`)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function createPatient(providerSlug: string, data: {
  name: string
  description?: string
  shift?: string
}): Promise<APIResponse<Patient>> {
  try {
    const res = await backendAPI.post<Patient>(`providers/${providerSlug}/patients`, data)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function updatePatient(providerSlug: string, id: number, data: {
  name?: string
  description?: string
  shift?: string
}): Promise<APIResponse<Patient>> {
  try {
    const res = await backendAPI.put<Patient>(`providers/${providerSlug}/patients/${id}`, data)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function deletePatient(providerSlug: string, id: number): Promise<APIResponse<undefined>> {
  try {
    await backendAPI.delete(`providers/${providerSlug}/patients/${id}`)
    return {}
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}
