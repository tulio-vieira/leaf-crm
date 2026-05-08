import axiosLib from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";
import type { AuthResponse, ProfileResponse, UserResponse } from "../models/User";

const BASE_URL = import.meta.env.VITE_BACKEND_URL as string;

export type APIResponse<T> = {
  errMsg?: string
  data?: T
}

type APIError = {
  errorCode?: string;
  type: string;
  title: string;
  status: number;
  instance: string;
  requestId: string;
  traceId: string;
}

const handleError = (err: any) => {
  if (!err?.response) {
    return 'No server response'
  } else if (err.response?.status < 500 && err.response.data) {
    let res = err.response.data as APIError
    return res.title
  }
  return "Request Failed"
}

class BackendAPI {
  public axios: AxiosInstance

  // Kept only to make refresh calls; set by AuthContext via setRefreshData()
  private _refreshToken: string | null = null
  private _email: string | null = null

  // Callbacks registered by AuthContext
  public onTokenRefreshed: ((data: AuthResponse) => void) | null = null
  public onAuthCleared: (() => void) | null = null

  private _refreshPromise: Promise<AuthResponse> | null = null

  constructor() {
    this.axios = axiosLib.create({
      baseURL: BASE_URL,
      withCredentials: true,
      headers: {
        Accept: "application/json"
      }
    });
  }

  public setRefreshData(email: string | null, refreshToken: string | null) {
    this._email = email
    this._refreshToken = refreshToken
  }

  private async authCall(path: string, postBody: any): Promise<AuthResponse> {
    const res = await this.axios.post<AuthResponse>(path, postBody)
    this.setRefreshData(res.data.email, res.data.refreshToken)
    this.onTokenRefreshed?.(res.data)
    return res.data
  }

  private clearAuth() {
    this.setRefreshData(null, null)
    this.onAuthCleared?.()
  }

  public async login(email: string, password: string): Promise<APIResponse<AuthResponse>> {
    try {
      return {
        data:  await this.authCall("auth/login", { email, password })
      }
      return {}
    } catch (err: any) {
      return { errMsg: handleError(err) }
    }
  }

  public async register(
    username: string,
    email: string,
    password: string
  ): Promise<APIResponse<UserResponse>> {
    try {
      const res = await this.axios.post<UserResponse>("auth/register", {
        username,
        email,
        password
      })
      return { data: res.data }
    } catch (err: any) {
      return { errMsg: handleError(err) }
    }
  }

  public async forgotPassword(email: string): Promise<APIResponse<UserResponse>> {
    try {
      const res = await this.axios.post<UserResponse>("auth/forgot-password", { email })
      return { data: res.data }
    } catch (err: any) {
      return { errMsg: handleError(err) }
    }
  }

  public async resetPassword(password: string, token: string): Promise<APIResponse<UserResponse>> {
    try {
      const res = await this.axios.post<UserResponse>("auth/reset-password", { password, token })
      return { data: res.data }
    } catch (err: any) {
      return { errMsg: handleError(err) }
    }
  }

  public async validateEmail(token: string): Promise<APIResponse<UserResponse>> {
    try {
      const res = await this.axios.post<UserResponse>("auth/validate-email", { token })
      return { data: res.data }
    } catch (err: any) {
      return { errMsg: handleError(err) }
    }
  }

  public async resendEmailValidation(email: string, password: string): Promise<APIResponse<UserResponse>> {
    try {
      const res = await this.axios.post<UserResponse>("auth/resend-email-validation", {
        email,
        password
      })
      return { data: res.data }
    } catch (err: any) {
      return { errMsg: handleError(err) }
    }
  }

  public async refreshCreds(email?: string, refreshToken?: string): Promise<AuthResponse> {
    if (this._refreshPromise) return this._refreshPromise
    this._refreshPromise = this.authCall("auth/refresh-token", {
      email: email ?? this._email,
      refreshToken: refreshToken ?? this._refreshToken
    }).catch(err => {
      this.clearAuth()
      throw err
    }).finally(() => {
      this._refreshPromise = null
    })
    return this._refreshPromise
  }

  public async logout(): Promise<void> {
    await this.axios.post("auth/logout")
    this._email = null
    this._refreshToken = null
  }

  private async withRetry<T>(method: string, path: string, postBody?: any, params?: any): Promise<AxiosResponse<T>> {
    let retryCount = 0
    while (retryCount <= 1) {
      try {
        return await this.axios<T>({ method, url: path, data: postBody, params })
      } catch (err: any) {
        if (err?.response?.status === 401 && retryCount === 0) {
          retryCount++
          await this.refreshCreds()
        } else {
          if (err?.response?.status === 401) {
            this.clearAuth()
          }
          throw err
        }
      }
    }
    throw new Error("Unreachable")
  }

  public async get<T>(path: string, params?: any): Promise<AxiosResponse<T>> {
    return this.withRetry<T>("GET", path, undefined, params)
  }

  public async post<T>(path: string, body?: any): Promise<AxiosResponse<T>> {
    return this.withRetry<T>("POST", path, body)
  }

  public async put<T>(path: string, body?: any): Promise<AxiosResponse<T>> {
    return this.withRetry<T>("PUT", path, body)
  }

  public async delete<T = void>(path: string): Promise<AxiosResponse<T>> {
    return this.withRetry<T>("DELETE", path)
  }

  public async getMyProfile(): Promise<APIResponse<ProfileResponse>> {
    try {
      const res = await this.get<ProfileResponse>("users/profile")
      return { data: res.data }
    } catch (err: any) {
      return { errMsg: handleError(err) }
    }
  }
}

export const backendAPI = new BackendAPI()
