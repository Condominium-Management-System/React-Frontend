export interface User {
  id: string
  fullName: string
  email: string
  phoneNumber?: string
  fan?: string
  role: string
  condoId?: string
  condoCode?: string
  condoName?: string
  isVerified?: boolean
  profilePhoto?: string
}

export interface UserProfileResponseData {
  user: User
}

export interface UserProfileResponse {
  success: boolean
  message?: string
  data: UserProfileResponseData | User
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponseData {
  accessToken: string
  refreshToken: string
  user: User
}

export interface LoginResponse {
  success: boolean
  message: string
  data: LoginResponseData
}

export interface RefreshTokenResponseData {
  accessToken: string
}

export interface RefreshTokenResponse {
  success: boolean
  message: string
  data: RefreshTokenResponseData
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  user: User
  rememberMe: boolean
}
