export interface PagedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  hasNextPage: boolean
}

export interface Provider {
  slug: string
  name: string
  description: string
  createdAt: string
}

export interface Patient {
  id: number
  name: string
  description: string
  shift: string | null
  providerSlug: string
  createdAt: string
}

export interface InsuranceAuthorization {
  id: number
  name: string
  insuranceName: string
  patientId: number
  providerSlug: string
  authorizedSessionCount: number
  attachedSessionCount: number
  remainingSessions: number
  paymentReceived: boolean
  priceCents: number
  description: string
  createdAt: string
  expiresAt: string
  patient?: Patient
  monitorExpired: boolean
  monitorAboutToExpire: boolean
  monitorAboutToBeFull: boolean
  expired: boolean
  aboutToExpire: boolean
  aboutToBeFull: boolean
}

export interface InsuranceAuthorizationRequest {
  name: string
  insuranceName: string
  authorizedSessionCount: number
  paymentReceived: boolean
  priceCents: number
  description: string
  expiresAt: string
  monitorExpired: boolean
  monitorAboutToExpire: boolean
  monitorAboutToBeFull: boolean
}

export interface InsuranceAuthorizationSnapshot {
  id: number
  insuranceAuthorizationId: number
  name: string
  authorizedSessionCount: number
  paymentReceived: boolean
  priceCents: number
  description: string
  expiresAt: string
  createdAt: string
}

export interface TreatmentSession {
  id: number
  name: string
  patientId: number
  providerSlug: string
  insuranceAuthorizationId: number | null
  insuranceAuthorization?: InsuranceAuthorization
  description?: string
  paymentReceived: boolean
  priceCents: number | null
  start: string
  end: string
  createdAt: string
}

export interface Notification {
  id: number
  message: string
  providerSlug: string
  acknowledgedByUserEmail: string | null
  createdAt: string
}

export interface Insurance {
  id: number
  name: string
  description: string | null
  createdAt: string
}

export interface UserListItem {
  id: string
  name: string
  email: string
  isEmailConfirmed: boolean
  createdAt: string
  roleId: string | null
  roleName: string | null
}

export interface Role {
  id: string
  name: string
  permissions: string
  homePage: string | null
  createdAt: string
  modifiedAt: string
  changedBy: string
}
