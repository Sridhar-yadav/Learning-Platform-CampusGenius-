import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
export const dynamic = 'force-dynamic';
import { authOptions } from "@/lib/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    // Forward to Django Backend
    const response = await fetch(`${BACKEND_URL}/faculty/ai/process/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        // Note: Do NOT set Content-Type header when sending FormData, 
        // fetch will set it automatically with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Backend Error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Error proxing upload:", error);
    return NextResponse.json(
      { error: error.message || "Error processing file" },
      { status: 500 }
    );
  }
}
