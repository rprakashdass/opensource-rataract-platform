import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const { loginId, password, email } = await req.json();
    const identifier = loginId || email; // Fallback to email for backwards compatibility
    
    if (!identifier || !password) {
      return NextResponse.json({ error: "Login ID and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: identifier.toLowerCase() },
    });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid Login ID or password" }, { status: 401 });
    }

    const role = user.role || "MEMBER";

    await setSession({
      id: user.id,
      email: user.email,
      name: user.name || "User",
      role,
    });

    return NextResponse.json({ success: true, role });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
