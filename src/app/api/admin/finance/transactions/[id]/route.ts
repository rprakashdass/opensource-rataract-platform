import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email";

function adminOnly(session: any) {
  return session && (session.role === "ADMIN" || session.role === "CLUB_ADMIN");
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!adminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { status } = await req.json();

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: { status },
      include: {
        user: true,
      }
    });

    if (transaction.user?.email) {
      const emailSubject = status === "APPROVED" 
        ? "Payment Request Approved" 
        : "Payment Request Rejected";
      
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Payment Request was ${status}</h2>
          <p>Hi ${transaction.user.name || "Member"},</p>
          <p>Your recent payment request for <strong>$${transaction.amount}</strong> (${transaction.description}) has been <strong>${status}</strong> by the finance team.</p>
          <p>You can view the full details in your member portal.</p>
          <br/>
          <p>Best,<br/>Rotaract Club Finance Team</p>
        </div>
      `;

      // Fire and forget email
      sendEmail({
        to: transaction.user.email,
        subject: emailSubject,
        html: emailHtml
      }).catch(err => console.error("Failed to send transaction email:", err));
    }

    return NextResponse.json(transaction);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
