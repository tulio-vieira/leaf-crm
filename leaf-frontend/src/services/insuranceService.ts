import type { Insurance } from '../models/Domain'
import { backendAPI, type APIResponse } from './backendService'

export async function listInsurances(): Promise<APIResponse<Insurance[]>> {
  try {
    const res = await backendAPI.get<Insurance[]>('insurances')
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function createInsurance(data: { name: string; description?: string }): Promise<APIResponse<Insurance>> {
  try {
    const res = await backendAPI.post<Insurance>('insurances', data)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function updateInsurance(id: number, data: { name: string; description?: string }): Promise<APIResponse<Insurance>> {
  try {
    const res = await backendAPI.put<Insurance>(`insurances/${id}`, data)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function deleteInsurance(id: number): Promise<APIResponse<void>> {
  try {
    await backendAPI.delete(`insurances/${id}`)
    return {}
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}
