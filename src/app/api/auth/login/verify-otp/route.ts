import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and verification code are required" }, { status: 400 });
    }

    const verificationRecord = await prisma.verificationCode.findFirst({
      where: {
        email: email.toLowerCase(),
        code: code.trim(),
        expiresAt: { gt: new Date() },
      },
    });

    if (!verificationRecord) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const roles = user.roles && user.roles.length > 0 ? user.roles : ["MEMBER"];

    // Set the session cookie (role-based session length is already computed inside setSession)
    await setSession({
      id: user.id,
      email: user.email,
      name: user.name || "",
      roles,
    });

    // Delete verification codes for this email so they cannot be reused
    await prisma.verificationCode.deleteMany({
      where: { email: email.toLowerCase() },
    });

    return NextResponse.json({ success: true, roles });
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
