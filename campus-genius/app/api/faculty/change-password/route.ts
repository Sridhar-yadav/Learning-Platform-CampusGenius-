import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  // Backend expects { new_password1, new_password1 } usually, or old_password.
  // dj-rest-auth expects: { new_password1, old_password } (optional old_password).
  // Frontend sends: { currentPassword, newPassword }.
  // Need to map fields.
  const payload = {
    old_password: body.currentPassword,
    new_password1: body.newPassword
  };

  const res = await fetch(`${BACKEND_URL}/auth/password/change/`, {
    method: 'POST', // dj-rest-auth uses POST for password change
    headers: {
      'Authorization': `Bearer ${session.user.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const txt = await res.text();
    return new NextResponse(txt, { status: res.status });
  }
  return NextResponse.json({ message: "Password updated successfully" });
} 