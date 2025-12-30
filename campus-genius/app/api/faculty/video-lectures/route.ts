import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
export const dynamic = 'force-dynamic';
import { authOptions } from "@/lib/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) return new NextResponse("Unauthorized", { status: 401 });

  const res = await fetch(`${BACKEND_URL}/faculty/videos/`, {
    headers: { 'Authorization': `Bearer ${session.user.accessToken}` }
  });
  if (!res.ok) return new NextResponse(res.statusText, { status: res.status });
  return NextResponse.json(await res.json());
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) return new NextResponse("Unauthorized", { status: 401 });

  const formData = await req.formData();
  // Backend expects 'video_file', frontend sends 'video'. Map it.
  const backendFormData = new FormData();
  for (const [key, value] of formData.entries()) {
    if (key === 'video') backendFormData.append('video_file', value);
    else if (key === 'courseId') backendFormData.append('course', value); // Backend usually expects 'course' ID
    else backendFormData.append(key, value);
  }

  const res = await fetch(`${BACKEND_URL}/faculty/videos/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.user.accessToken}`
    },
    body: backendFormData
  });

  if (!res.ok) {
    const txt = await res.text();
    return new NextResponse(txt, { status: res.status });
  }
  return NextResponse.json(await res.json(), { status: 201 });
} 