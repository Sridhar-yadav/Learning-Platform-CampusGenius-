import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
export const dynamic = 'force-dynamic';
import { authOptions } from "@/lib/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) return new NextResponse("Unauthorized", { status: 401 });

  const res = await fetch(`${BACKEND_URL}/faculty/meetings/`, {
    headers: { 'Authorization': `Bearer ${session.user.accessToken}` }
  });
  if (!res.ok) return new NextResponse(res.statusText, { status: res.status });
  return NextResponse.json(await res.json());
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const res = await fetch(`${BACKEND_URL}/faculty/meetings/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.user.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) return new NextResponse(await res.text(), { status: res.status }); // text() to capture error details
  return NextResponse.json(await res.json(), { status: 201 });
}