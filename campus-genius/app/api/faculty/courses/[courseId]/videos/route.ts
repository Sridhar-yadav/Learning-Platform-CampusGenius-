import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function GET(req: NextRequest, { params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) return new NextResponse("Unauthorized", { status: 401 });

  // Assuming backend filtering for videos by course_id needs to be implemented or uses query param
  // VideoLectureViewSet in backend needs 'course_id' filter logic if it doesn't have it. 
  // We'll trust we can fix backend if needed.
  const res = await fetch(`${BACKEND_URL}/faculty/videos/?course_id=${params.courseId}`, {
    headers: { 'Authorization': `Bearer ${session.user.accessToken}` }
  });
  if (!res.ok) return new NextResponse(res.statusText, { status: res.status });
  return NextResponse.json(await res.json());
}

export async function POST(req: NextRequest, { params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) return new NextResponse("Unauthorized", { status: 401 });

  const formData = await req.formData();
  // Backend expects 'video_file', frontend 'file'. Map it.
  const backendFormData = new FormData();
  for (const [key, value] of formData.entries()) {
    if (key === 'file') backendFormData.append('video_file', value);
    else if (key === 'courseId') backendFormData.append('course', params.courseId);
    else backendFormData.append(key, value);
  }
  // Ensure course ID is present
  if (!backendFormData.has('course')) {
    backendFormData.append('course', params.courseId);
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