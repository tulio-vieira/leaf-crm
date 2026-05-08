export interface PagedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  hasNextPage: boolean
}

export interface Notification {
  id: number
  message: string
  acknowledgedByUserEmail: string | null
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
