"use server";

import { sendEmail } from "@/lib/email";

interface InquiryData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  subject: string;
  contactEmail: string;
  clubName: string;
}

export async function submitPartnerInquiry(data: InquiryData) {
  if (!data.name || !data.email || !data.message) {
    return { error: "Please fill in all required fields." };
  }

  const emailSubject = `Partnership Inquiry — ${data.name} (${data.company || "No Company"})`;
  
  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #0B132B; margin-bottom: 24px;">New Partnership / Sponsorship Inquiry</h2>
      
      <p style="font-size: 14px; color: #4a5568; line-height: 1.6;">
        You have received a new inquiry from the public website for <strong>${data.clubName}</strong>.
      </p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #4a5568; width: 120px;">Name:</td>
          <td style="padding: 8px 0; color: #1a202c;">${data.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Email:</td>
          <td style="padding: 8px 0; color: #1a202c;"><a href="mailto:${data.email}">${data.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Phone:</td>
          <td style="padding: 8px 0; color: #1a202c;">${data.phone || "Not provided"}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Company:</td>
          <td style="padding: 8px 0; color: #1a202c;">${data.company || "Not provided"}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Topic/Pledge:</td>
          <td style="padding: 8px 0; color: #1a202c; font-weight: bold; color: #F7A800;">${data.subject}</td>
        </tr>
      </table>
      
      <div style="background-color: #f7fafc; padding: 16px; border-radius: 8px; border: 1px solid #edf2f7; margin-top: 16px;">
        <span style="font-size: 10px; font-weight: bold; color: #718096; text-transform: uppercase;">Message:</span>
        <p style="font-size: 14px; color: #2d3748; line-height: 1.6; margin-top: 8px; white-space: pre-wrap;">${data.message}</p>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 32px 0;" />
      
      <p style="font-size: 11px; color: #a0aec0; text-align: center;">
        This email was sent automatically from the Rotaract Platform website system.
      </p>
    </div>
  `;

  try {
    const res = await sendEmail({
      to: data.contactEmail,
      subject: emailSubject,
      html: emailHtml,
      from: `"Partnership System" <${process.env.GMAIL_USER}>`
    });

    if (res.success) {
      return { success: true };
    } else {
      return { error: "Failed to send email. Please try copying the email address instead." };
    }
  } catch (error: any) {
    return { error: error.message || "An unexpected error occurred." };
  }
}
