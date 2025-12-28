import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      accessToken: string
      refreshToken: string
      accessTokenExpires?: number
      error?: string
    } & DefaultSession["user"]
    error?: string
  }

  interface User extends DefaultUser {
    id: string
    role: string
    accessToken: string
    refreshToken: string
    accessTokenExpires?: number
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    role: string
    accessToken: string
    refreshToken: string
    accessTokenExpires?: number
    error?: string
  }
}
