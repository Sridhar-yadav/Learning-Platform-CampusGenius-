import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) return new NextResponse("Unauthorized", { status: 401 });

  const res = await fetch(`${BACKEND_URL}/student/notes/`, {
    headers: { 'Authorization': `Bearer ${session.user.accessToken}` }
  });
  if (!res.ok) return new NextResponse(res.statusText, { status: res.status });
  return NextResponse.json(await res.json());
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const formData = await req.formData();

    // Forward to Django
    // Note: When sending FormData with fetch, do NOT set Content-Type header manually.
    // The browser/runtime sets it with the boundary.
    const res = await fetch(`${BACKEND_URL}/student/notes/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        // 'Content-Type': 'multipart/form-data', // DO NOT SET THIS explicitly
      },
      body: formData as any // Next.js fetch supports FormData
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("Django Error:", txt);
      return new NextResponse(txt, { status: res.status });
    }

    return NextResponse.json(await res.json(), { status: 201 });
  } catch (error) {
    console.error("Proxy Error:", error);
    return new NextResponse(JSON.stringify({ error: "Upload failed" }), { status: 500 });
  }
}
