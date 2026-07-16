import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email";

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

    const roles = user.roles && user.roles.length > 0 ? user.roles : ["MEMBER"];
    const adminRoles = ["SUPER_ADMIN", "ADMIN", "CLUB_ADMIN", "FINANCE_ADMIN", "FINANCE_VIEWER"];
    const isAdmin = roles.some((r: string) => adminRoles.includes(r));

    if (isAdmin) {
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
        subject: "Verification Code - Security Verification",
        html: `
          <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 24px auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 24px; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);">
            <h2 style="color: #0b132b; font-size: 24px; font-weight: 800; margin-top: 0; margin-bottom: 8px; tracking-tight: -0.02em;">Verify Admin Access</h2>
            <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">Please use the verification code below to authorize your admin login. This code is only valid for 10 minutes.</p>
            <div style="background-color: #faf9f6; padding: 20px; border-radius: 16px; text-align: center; border: 1px dashed #f7a800; margin-bottom: 24px;">
              <span style="font-size: 36px; font-weight: 900; letter-spacing: 0.2em; color: #f7a800; padding-left: 0.2em;">${code}</span>
            </div>
            <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-bottom: 0; padding-top: 16px; border-top: 1px solid #f1f5f9;">If you did not request this, you can safely ignore this email.</p>
          </div>
        `,
      });

      if (!mailResult.success) {
        return NextResponse.json({ error: "Failed to dispatch email verification" }, { status: 500 });
      }

      return NextResponse.json({ requiresOtp: true, email: user.email });
    }

    await setSession({
      id: user.id,
      email: user.email,
      name: user.name || "",
      roles,
    });

    return NextResponse.json({ success: true, roles });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
