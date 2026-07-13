import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email";

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
    const mailResult = await sendEmail({
      to: user.email,
      subject: "Security Verification Code - Change Password",
      html: `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 24px auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 24px; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);">
          <h2 style="color: #0b132b; font-size: 24px; font-weight: 800; margin-top: 0; margin-bottom: 8px; tracking-tight: -0.02em;">Verify Identity</h2>
          <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">Use the code below to complete your password change. This code is only valid for 10 minutes.</p>
          <div style="background-color: #faf9f6; padding: 20px; border-radius: 16px; text-align: center; border: 1px dashed #f7a800; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: 900; letter-spacing: 0.2em; color: #f7a800; padding-left: 0.2em;">${code}</span>
          </div>
          <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-bottom: 0; padding-top: 16px; border-t: 1px solid #f1f5f9;">If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
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
