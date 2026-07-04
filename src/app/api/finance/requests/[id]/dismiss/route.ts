import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.member.findUnique({
      where: { userId: session.id }
    });

    if (!member) {
      return NextResponse.json({ error: "Member profile not found" }, { status: 404 });
    }

    const request = await prisma.paymentRequest.findUnique({
      where: { id }
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Append to dismissedBy array
    const updatedRequest = await prisma.paymentRequest.update({
      where: { id },
      data: {
        dismissedBy: {
          push: member.id
        }
      }
    });

    return NextResponse.json(updatedRequest);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
