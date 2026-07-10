import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession , canManageFinance } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email";

function adminOnly(session: any) {
  return session && session.roles?.some((r: string) => ["SUPER_ADMIN", "CLUB_ADMIN", "FINANCE_ADMIN"].includes(r));
}

function financeAdminOnly(session: any) {
  return session && session.roles?.some((r: string) => ["SUPER_ADMIN", "CLUB_ADMIN", "FINANCE_ADMIN"].includes(r));
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!financeAdminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized. Finance Admin required." }, { status: 403 });
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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!financeAdminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized. Finance Admin required." }, { status: 403 });
    }

    const { amount, description, date, category } = await req.json();

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount: parseFloat(amount),
        description,
        date: date ? new Date(date) : undefined,
        category,
      }
    });

    return NextResponse.json(transaction);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!financeAdminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized. Finance Admin required." }, { status: 403 });
    }

    await prisma.transaction.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
