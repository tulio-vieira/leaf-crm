import { backendAPI, type APIResponse } from './backendService'

export async function deleteNotification(providerSlug: string, id: number): Promise<APIResponse<void>> {
  try {
    await backendAPI.delete(`providers/${providerSlug}/notifications/${id}`)
    return {}
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function acknowledgeNotification(providerSlug: string, id: number): Promise<APIResponse<void>> {
  try {
    await backendAPI.post(`providers/${providerSlug}/notifications/${id}/acknowledge`)
    return {}
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}
