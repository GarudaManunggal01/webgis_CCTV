import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await authenticateRequest(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ valid: true, userId: user.userId, role: user.role });
}
