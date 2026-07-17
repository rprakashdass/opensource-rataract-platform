"use server";

import { prisma } from "@/lib/prisma";

const globalRateLimit = globalThis as unknown as {
  inquiryRateLimits?: Map<string, number>;
};

export async function submitInquiry(data: { clubId: string, name: string, email: string, phone: string, interestMessage: string, _honey?: string }) {
  try {
    if (data._honey) {
      return { success: true };
    }

    const limits = globalRateLimit.inquiryRateLimits ?? new Map<string, number>();
    globalRateLimit.inquiryRateLimits = limits;
    
    const now = Date.now();
    const lastSubmitted = limits.get(data.email) || 0;
    if (now - lastSubmitted < 60 * 1000) {
      return { error: "Please wait a minute before submitting another inquiry." };
    }
    limits.set(data.email, now);

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
