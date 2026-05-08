import type { Notification, PagedResponse } from '../models/Domain'
import { backendAPI, type APIResponse } from './backendService'

// const PAGE_SIZE = parseInt(import.meta.env.VITE_PAGE_SIZE ?? '20')

export async function listAllNotifications(params = new URLSearchParams()): Promise<APIResponse<PagedResponse<Notification>>> {
  try {
    const res = await backendAPI.get<PagedResponse<Notification>>('list/notifications', params)
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}
