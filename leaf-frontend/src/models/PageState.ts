export interface PageState<T = undefined> {
  isLoading?: boolean
  errMsg?: string
  data?: T
}
