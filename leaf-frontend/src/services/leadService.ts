import type { Lead, PagedResponse } from '../models/Domain'
import { backendAPI, type APIResponse } from './backendService'

const PAGE_SIZE = parseInt(import.meta.env.VITE_PAGE_SIZE ?? '20')

export interface LeadRequest {
  name: string
  description?: string
  boardId: number
  columnIdx: number
  position?: string
  assignedToUserGuid?: string | null
}

export async function listLeads(params: { page?: number; boardId?: number }): Promise<APIResponse<PagedResponse<Lead>>> {
  try {
    const { page = 1, boardId } = params
    const query: Record<string, unknown> = { page, pageSize: PAGE_SIZE }
    if (boardId !== undefined) query.boardId = boardId
    const res = await backendAPI.get<PagedResponse<Lead>>('leads', query)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function getLead(id: number): Promise<APIResponse<Lead>> {
  try {
    const res = await backendAPI.get<Lead>(`leads/${id}`)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function createLead(data: LeadRequest): Promise<APIResponse<Lead>> {
  try {
    const res = await backendAPI.post<Lead>('leads', data)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function updateLead(id: number, data: LeadRequest): Promise<APIResponse<Lead>> {
  try {
    const res = await backendAPI.put<Lead>(`leads/${id}`, data)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function listAllLeads(params: { boardId: number }): Promise<APIResponse<Lead[]>> {
  try {
    const res = await backendAPI.get<PagedResponse<Lead>>('leads', { page: 1, pageSize: 100, boardId: params.boardId })
    return { data: res.data.items }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function listColumnLeads(params: {
  boardId: number
  columnIdx: number
  afterPosition?: string
  pageSize?: number
}): Promise<APIResponse<PagedResponse<Lead>>> {
  try {
    const { boardId, columnIdx, afterPosition, pageSize = PAGE_SIZE } = params
    const query: Record<string, unknown> = { boardId, columnIdx, pageSize }
    if (afterPosition !== undefined) query.afterPosition = afterPosition
    const res = await backendAPI.get<PagedResponse<Lead>>('leads', query)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function deleteLead(id: number): Promise<APIResponse<undefined>> {
  try {
    await backendAPI.delete(`leads/${id}`)
    return {}
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}
