
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { TextEncoder } from "util";

export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

export type UserRole = "student" | "faculty";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export async function createToken(user: User) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (
      typeof payload.id === "string" &&
      typeof payload.email === "string" &&
      typeof payload.name === "string" &&
      (payload.role === "student" || payload.role === "faculty")
    ) {
      return payload as unknown as User;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
  const token = cookies().get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}