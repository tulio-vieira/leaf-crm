import type { Board, PagedResponse } from '../models/Domain'
import { backendAPI, type APIResponse } from './backendService'

export async function listAllBoards(): Promise<APIResponse<Board[]>> {
  try {
    const res = await backendAPI.get<PagedResponse<Board>>('boards', { page: 1, pageSize: 100 })
    return { data: res.data.items }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}
