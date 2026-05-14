import type { Board, BoardDetailResponse, PagedResponse } from '../models/Domain'
import { backendAPI, type APIResponse } from './backendService'

const PAGE_SIZE = parseInt(import.meta.env.VITE_PAGE_SIZE ?? '20')

export interface BoardCreateRequest {
  name: string
  description?: string
  columns: { name: string }[]
}

export interface BoardUpdateRequest {
  name: string
  description?: string
}

export async function listAllBoards(): Promise<APIResponse<Board[]>> {
  try {
    const res = await backendAPI.get<PagedResponse<Board>>('boards', { page: 1, pageSize: 100 })
    return { data: res.data.items }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function listBoards(params: { page?: number }): Promise<APIResponse<PagedResponse<Board>>> {
  try {
    const { page = 1 } = params
    const res = await backendAPI.get<PagedResponse<Board>>('boards', { page, pageSize: PAGE_SIZE })
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function getBoard(id: number): Promise<APIResponse<BoardDetailResponse>> {
  try {
    const res = await backendAPI.get<BoardDetailResponse>(`boards/${id}`)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function createBoard(data: BoardCreateRequest): Promise<APIResponse<Board>> {
  try {
    const res = await backendAPI.post<Board>('boards', data)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function updateBoard(id: number, data: BoardUpdateRequest): Promise<APIResponse<Board>> {
  try {
    const res = await backendAPI.put<Board>(`boards/${id}`, data)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function deleteBoard(id: number): Promise<APIResponse<undefined>> {
  try {
    await backendAPI.delete(`boards/${id}`)
    return {}
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}
