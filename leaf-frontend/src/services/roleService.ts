import type { Role } from '../models/Domain'
import { backendAPI, type APIResponse } from './backendService'

export async function listRoles(): Promise<APIResponse<Role[]>> {
  try {
    const res = await backendAPI.get<Role[]>('roles')
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function createRole(data: {
  name: string
  permissions: string
  homePage?: string | null
}): Promise<APIResponse<Role>> {
  try {
    const res = await backendAPI.post<Role>('roles', data)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function updateRole(
  id: string,
  data: { name: string; permissions: string; homePage?: string | null }
): Promise<APIResponse<Role>> {
  try {
    const res = await backendAPI.put<Role>(`roles/${id}`, data)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function deleteRole(id: string): Promise<APIResponse<undefined>> {
  try {
    await backendAPI.delete(`roles/${id}`)
    return {}
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}
