import type { PagedResponse, Provider } from '../models/Domain'
import { backendAPI, type APIResponse } from './backendService'

const PAGE_SIZE = parseInt(import.meta.env.VITE_PAGE_SIZE ?? '20')

export async function listProviders(page: number = 1): Promise<APIResponse<PagedResponse<Provider>>> {
  try {
    const res = await backendAPI.get<PagedResponse<Provider>>('providers', { page, pageSize: PAGE_SIZE })
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function listAllowedProviders(): Promise<APIResponse<Provider[]>> {
  try {
    const res = await backendAPI.get<Provider[]>('providers/allowedList')
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function createProvider(data: {
  name: string
  slug: string
  description: string
}): Promise<APIResponse<Provider>> {
  try {
    const res = await backendAPI.post<Provider>('providers', data)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function getProvider(slug: string): Promise<APIResponse<Provider>> {
  try {
    const res = await backendAPI.get<Provider>(`providers/${slug}`)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function updateProvider(slug: string, data: {
  name: string
  description: string
}): Promise<APIResponse<Provider>> {
  try {
    const res = await backendAPI.put<Provider>(`providers/${slug}`, data)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function deleteProvider(slug: string): Promise<APIResponse<undefined>> {
  try {
    await backendAPI.delete(`providers/${slug}`)
    return {}
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}
