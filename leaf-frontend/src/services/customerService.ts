import type { Customer, CustomerOption, PagedResponse } from '../models/Domain'
import { backendAPI, type APIResponse } from './backendService'

const PAGE_SIZE = parseInt(import.meta.env.VITE_PAGE_SIZE ?? '20')

export interface CustomerRequest {
  name: string
  description?: string
  email?: string
  phoneNumber?: string
  address?: string
  company?: string
}

export async function listCustomers(params: { page?: number; name?: string }): Promise<APIResponse<PagedResponse<Customer>>> {
  try {
    const { page = 1, name } = params
    const query: Record<string, unknown> = { page, pageSize: PAGE_SIZE }
    if (name) query.name = name
    const res = await backendAPI.get<PagedResponse<Customer>>('customers', query)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function getCustomer(id: number): Promise<APIResponse<Customer>> {
  try {
    const res = await backendAPI.get<Customer>(`customers/${id}`)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function createCustomer(data: CustomerRequest): Promise<APIResponse<Customer>> {
  try {
    const res = await backendAPI.post<Customer>('customers', data)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function updateCustomer(id: number, data: CustomerRequest): Promise<APIResponse<Customer>> {
  try {
    const res = await backendAPI.put<Customer>(`customers/${id}`, data)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function deleteCustomer(id: number): Promise<APIResponse<undefined>> {
  try {
    await backendAPI.delete(`customers/${id}`)
    return {}
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function searchCustomers(name: string): Promise<APIResponse<CustomerOption[]>> {
  try {
    const params: Record<string, unknown> = { pageSize: 20 }
    if (name) params.name = name
    const res = await backendAPI.get<PagedResponse<Customer>>('customers', params)
    return { data: res.data.items.map(c => ({ id: c.id, name: c.name })) }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}
