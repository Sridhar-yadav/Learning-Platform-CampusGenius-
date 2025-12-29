import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export const dynamic = 'force-dynamic';
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    console.log("[STUDENT_STATS] Request received");

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.log("[STUDENT_STATS] No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[STUDENT_STATS] Session verified successfully", session.user);

    // Mock data (replace with DB query)
    const stats = {
      quizzes: 5,
      meetings: 3,
      notes: 12,
      videoLectures: 8,
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("[STUDENT_STATS_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
