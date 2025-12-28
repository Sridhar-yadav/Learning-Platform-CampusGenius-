import { NextResponse } from "next/server"
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Define paths
    const isAuthPath = path.startsWith("/auth")
    const isPublicPath = path === "/" || path.startsWith("/api/auth") // Allow NextAuth API
    const isStudentPath = path.startsWith("/student")
    const isFacultyPath = path.startsWith("/faculty")

    // 1. Unauthenticated users
    if (!token) {
      if (isAuthPath || isPublicPath) {
        return NextResponse.next()
      }
      // Redirect to login for any other protected route
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    // 2. Authenticated users trying to access auth pages OR root
    if (isAuthPath || path === "/") {
      // If no role is present (legacy session or error), allow access to auth pages to sign out/in
      if (!token.role) {
        if (path === "/") return NextResponse.redirect(new URL("/auth/login", req.url))
        return NextResponse.next()
      }

      if (token.role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", req.url))
      const redirectPath = token.role === "faculty" ? "/faculty/dashboard" : "/student/dashboard"
      return NextResponse.redirect(new URL(redirectPath, req.url))
    }

    // 3. Role-Based Access Control
    if (isStudentPath && token.role !== "student") {
      // If valid faculty, go to faculty dashboard
      if (token.role === "faculty") return NextResponse.redirect(new URL("/faculty/dashboard", req.url))
      if (token.role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", req.url))
      // Fallback: If role implies they shouldn't be here, send to login if unknown
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    if (isFacultyPath && token.role !== "faculty") {
      // If valid student, go to student dashboard
      if (token.role === "student") return NextResponse.redirect(new URL("/student/dashboard", req.url))
      if (token.role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", req.url))
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // We handle redirection in the middleware function, so we return true to let it execute.
        // Returning false would trigger default NextAuth unauthorized behavior which might conflict.
        return true
      }
    }
  }
)

export const config = {
  matcher: [
    "/",
    "/student/:path*",
    "/faculty/:path*",
    "/auth/:path*",
  ],
}
