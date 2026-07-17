import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email";
import { getOtpEmailHtml } from "@/lib/email-templates";

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

    // System accounts (e.g. @nexus domain) have no real inbox — skip OTP
    const systemDomain = process.env.SYSTEM_ACCOUNT_DOMAIN || "nexus";
    const emailDomain = user.email.split("@")[1]?.toLowerCase();
    const isSystemAccount = emailDomain === systemDomain;

    if (isAdmin && !isSystemAccount) {
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
        subject: "Verification Code - Security Verification",
        text: `Your verification code to access the portal is: ${code}. This code is valid for 10 minutes.`,
        html: getOtpEmailHtml(code, club),
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
