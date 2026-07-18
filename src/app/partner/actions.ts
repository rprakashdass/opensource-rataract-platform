"use server";

import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getPartnerReplyEmailHtml } from "@/lib/email-templates";

interface InquiryData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  subject: string;
  contactEmail: string;
  clubName: string;
  causeType?: "PROJECT" | "EVENT";
  causeId?: string;
  _honey?: string;
}

const globalRateLimit = globalThis as unknown as {
  partnerInquiryRateLimits?: Map<string, number>;
};

export async function submitPartnerInquiry(data: InquiryData) {
  if (data._honey) {
    return { success: true };
  }

  const limits = globalRateLimit.partnerInquiryRateLimits ?? new Map<string, number>();
  globalRateLimit.partnerInquiryRateLimits = limits;
  
  const now = Date.now();
  const lastSubmitted = limits.get(data.email) || 0;
  if (now - lastSubmitted < 60 * 1000) {
    return { error: "Please wait a minute before submitting another inquiry." };
  }
  limits.set(data.email, now);

  if (!data.name || !data.email || !data.message) {
    return { error: "Please fill in all required fields." };
  }

  try {
    const club = await prisma.club.findFirst();
    if (!club) return { error: "Club not found." };

    let validatedCauseType = data.causeType;
    let validatedCauseId = data.causeId;

    // Validate cause server-side
    if (validatedCauseType && validatedCauseId) {
      if (validatedCauseType === "PROJECT") {
        const p = await prisma.project.findFirst({ where: { id: validatedCauseId, clubId: club.id, seekingSponsorship: true }});
        if (!p) {
          validatedCauseType = undefined;
          validatedCauseId = undefined;
        }
      } else if (validatedCauseType === "EVENT") {
        const e = await prisma.event.findFirst({ where: { id: validatedCauseId, clubId: club.id, seekingSponsorship: true }});
        if (!e) {
          validatedCauseType = undefined;
          validatedCauseId = undefined;
        }
      } else {
        validatedCauseType = undefined;
        validatedCauseId = undefined;
      }
    }

    const inquiry = await prisma.partnerInquiry.create({
      data: {
        clubId: club.id,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        subject: data.subject || null,
        message: data.message,
        causeType: validatedCauseType,
        causeId: validatedCauseId,
        status: "PENDING"
      }
    });

    const emailSubject = `Partnership Inquiry — ${data.name} (${data.company || "No Company"})`;
    
    // Try sending email, but don't fail if it fails
    try {
      const plainText = `New Partnership Inquiry for ${data.clubName}:\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || "None"}\nCompany: ${data.company || "None"}\nTopic/Pledge: ${data.subject}\nMessage: ${data.message}`;

      await sendEmail({
        to: data.contactEmail,
        subject: emailSubject,
        text: plainText,
        html: getPartnerReplyEmailHtml(data, club),
        from: `"Partnership System" <${process.env.GMAIL_USER}>`
      });
    } catch (emailErr) {
      console.warn("Failed to send partner inquiry email:", emailErr);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Partner inquiry creation failed:", error);
    return { error: error.message || "An unexpected error occurred." };
  }
}
