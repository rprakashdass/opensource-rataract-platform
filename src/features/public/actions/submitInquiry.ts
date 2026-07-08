"use server";

import { prisma } from "@/lib/prisma";

export async function submitInquiry(data: { clubId: string, name: string, email: string, phone: string, interestMessage: string }) {
  try {
    if (!data.name || !data.email) {
      return { error: "Name and Email are required." };
    }

    const inquiry = await prisma.membershipInquiry.create({
      data: {
        clubId: data.clubId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        interestMessage: data.interestMessage,
        status: "PENDING",
      }
    });

    return { success: true, data: inquiry };
  } catch (error: any) {
    console.error("Failed to submit inquiry:", error);
    return { error: "Failed to submit your inquiry. Please try again later." };
  }
}
