export interface AuthResponse {
  username: string
  email: string
  accessToken: string
  refreshToken: string
  homePage: string
}

export interface UserResponse {
  email: string
  message?: string
}

export interface ProfileResponse {
  username: string;
  email: string;
  isEmailConfirmed: boolean;
  createdAt: string;
  roleId: string | null;
  roleName: string | null;
}
