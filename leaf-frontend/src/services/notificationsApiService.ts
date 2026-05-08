import { backendAPI, type APIResponse } from './backendService'

export async function deleteNotification(id: number): Promise<APIResponse<void>> {
  try {
    await backendAPI.delete(`notifications/${id}`)
    return {}
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function acknowledgeNotification(id: number): Promise<APIResponse<void>> {
  try {
    await backendAPI.post(`notifications/${id}/acknowledge`)
    return {}
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}
