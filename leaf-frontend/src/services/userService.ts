import type { PagedResponse, UserListItem } from '../models/Domain'
import { backendAPI, type APIResponse } from './backendService'

const PAGE_SIZE = parseInt(import.meta.env.VITE_PAGE_SIZE ?? '20')

export interface UserRequest {
  name: string
  email: string
  isEmailConfirmed: boolean
  roleId: string | null
}

export async function listUsers(page: number = 1, roleId?: string): Promise<APIResponse<PagedResponse<UserListItem>>> {
  try {
    const params: Record<string, unknown> = { page, pageSize: PAGE_SIZE }
    if (roleId) params.roleId = roleId
    const res = await backendAPI.get<PagedResponse<UserListItem>>('users', params)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function createUser(data: UserRequest): Promise<APIResponse<UserListItem>> {
  try {
    const res = await backendAPI.post<UserListItem>('users', data)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function updateUser(userId: string, data: UserRequest): Promise<APIResponse<UserListItem>> {
  try {
    const res = await backendAPI.put<UserListItem>(`users/${userId}`, data)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function deleteUser(userId: string): Promise<APIResponse<undefined>> {
  try {
    await backendAPI.delete(`users/${userId}`)
    return {}
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function changeUserPassword(userId: string, newPassword: string): Promise<APIResponse<undefined>> {
  try {
    await backendAPI.post(`users/${userId}/change-password`, { newPassword })
    return {}
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function resendPasswordReset(userId: string): Promise<APIResponse<undefined>> {
  try {
    await backendAPI.post(`users/${userId}/resend-password-reset`)
    return {}
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function resendEmailValidation(userId: string): Promise<APIResponse<undefined>> {
  try {
    await backendAPI.post(`users/${userId}/resend-email-validation`)
    return {}
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}
