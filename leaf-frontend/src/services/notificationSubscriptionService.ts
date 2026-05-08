import { backendAPI, type APIResponse } from './backendService'

export async function getMySubscriptions(): Promise<APIResponse<string[]>> {
  try {
    const res = await backendAPI.get<string[]>('my/notification-subscriptions')
    return { data: res.data }
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function subscribe(providerSlug: string): Promise<APIResponse<void>> {
  try {
    await backendAPI.post(`providers/${providerSlug}/notification-subscriptions`)
    return {}
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}

export async function unsubscribe(providerSlug: string): Promise<APIResponse<void>> {
  try {
    await backendAPI.delete(`providers/${providerSlug}/notification-subscriptions`)
    return {}
  } catch (err: any) {
    return { errMsg: err?.response?.data?.title ?? 'Request failed' }
  }
}
