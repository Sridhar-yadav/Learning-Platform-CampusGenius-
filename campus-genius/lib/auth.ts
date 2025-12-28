import { NextAuthOptions, User } from "next-auth";
import { Provider } from "next-auth/providers";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { jwtDecode } from "jwt-decode";
import { JWT } from "next-auth/jwt";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const BACKEND_ROOT = API_URL.replace(/\/api\/?$/, "");

interface BackendLoginResponse {
  refresh: string;
  access: string;
  role: string;
  username: string;
  id?: string;
}

export type UserRole = "student" | "faculty" | "admin";

/**
 * Interface for the decoded Django SimpleJWT access token
 */
interface DecodedToken {
  exp: number;
  user_id: number;
  role?: string;
}

/**
 * Takes a NextAuth token and attempts to refresh the backend access token.
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const url = `${BACKEND_ROOT}/auth/token/refresh/`;
    console.log("[AUTH] Refreshing access token at:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: token.refreshToken }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      console.error("[AUTH] Refresh failed:", refreshedTokens);
      throw refreshedTokens;
    }

    // Decode new access token to get new expiry
    const decoded = jwtDecode<DecodedToken>(refreshedTokens.access);

    return {
      ...token,
      accessToken: refreshedTokens.access,
      accessTokenExpires: decoded.exp * 1000, // Sync with backend expiry
      refreshToken: refreshedTokens.refresh ?? token.refreshToken, // Fallback to old refresh token if rotation is off
    };
  } catch (error) {
    console.error("[AUTH] Error refreshing access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

// Define options separate from export for conditional logic
const providers: Provider[] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials): Promise<User | null> {
      try {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password");
        }

        const res = await fetch(`${BACKEND_ROOT}/auth/login/`, {
          method: 'POST',
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password
          }),
          headers: { "Content-Type": "application/json" }
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.detail || "Invalid credentials");
        }

        const data = await res.json();
        console.log("[AUTH] Backend login response:", data);

        if (!data.access || !data.refresh) {
          throw new Error("Token not returned from backend");
        }

        // Decode initial token to set expiry
        const decoded = jwtDecode<DecodedToken>(data.access);

        return {
          id: data.id ? String(data.id) : credentials.email,
          name: data.username ?? credentials.email.split("@")[0],
          email: credentials.email,
          role: data.role ?? "student",
          accessToken: data.access,
          refreshToken: data.refresh,
          accessTokenExpires: decoded.exp * 1000,
        };

      } catch (error) {
        console.error("[AUTH] Authorization error:", error);
        return null;
      }
    }
  }),
];

// Only add Google Provider if keys are present
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers: providers,
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user && account) {
        // 1. Google Provider handling
        if (account.provider === "google") {
          let role = "student"; // Default

          try {
            // Check if user exists in backend to get real role
            const checkUrl = `${BACKEND_ROOT}/auth/check-user/`;
            console.log("[AUTH] Checking user role at:", checkUrl);

            const res = await fetch(checkUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: user.email })
            });

            if (res.ok) {
              const data = await res.json();
              if (data.exists && data.role) {
                role = data.role;
                console.log("[AUTH] Found existing user with role:", role);
              }
            }
          } catch (e) {
            console.error("[AUTH] Role check failed, using default student role", e);
          }

          return {
            ...token,
            id: user.id || token.sub,
            name: user.name,
            email: user.email,
            role: role,
            accessToken: account.id_token || "",
            refreshToken: "",
            accessTokenExpires: Date.now() + (3600 * 1000), // Set 1 hour expiry to prevent immediate refresh loop
          } as JWT;
        }

        // 2. Credentials Provider handling (user object comes from authorize())
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
          role: user.role,
          id: user.id,
        } as JWT;
      }

      // Return previous token if the access token has not expired yet
      // buffer of 10 seconds
      if (Date.now() < (token.accessTokenExpires as number) - 10000) {
        return token;
      }

      // Skip refresh if we don't have a refresh token (e.g. Google Auth)
      if (!token.refreshToken) return token;

      // Access token has expired, try to refresh it
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.accessToken = token.accessToken as string;
        session.user.refreshToken = token.refreshToken as string;
        // @ts-ignore
        session.error = token.error; // Pass error to client for force logout handling
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

