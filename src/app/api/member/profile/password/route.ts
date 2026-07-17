import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email";
import { getOtpEmailHtml } from "@/lib/email-templates";

// POST: Generate & Send OTP Code
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
    });

    if (!user || !user.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate secure 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Upsert verification code to track OTP state
    await prisma.verificationCode.create({
      data: {
        email: user.email,
        code,
        expiresAt,
      },
    });

    // Send email with premium styles
    const club = await prisma.club.findFirst();
    const mailResult = await sendEmail({
      to: user.email,
      subject: "Security Verification Code - Change Password",
      text: `Your security verification code to change your password is: ${code}. This code is valid for 10 minutes.`,
      html: getOtpEmailHtml(code, club),
    });

    if (!mailResult.success) {
      return NextResponse.json({ error: "Failed to dispatch email verification" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error: any) {
    console.error("OTP send error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Validate OTP and Update Password
export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, newPassword } = await req.json();

    if (!code || !newPassword) {
      return NextResponse.json({ error: "Verification code and new password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
    });

    if (!user || !user.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find valid matching code in the database
    const verificationRecord = await prisma.verificationCode.findFirst({
      where: {
        email: user.email,
        code,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verificationRecord) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newPassword },
    });

    // Delete verification codes for this email so they cannot be reused
    await prisma.verificationCode.deleteMany({
      where: { email: user.email },
    });

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
