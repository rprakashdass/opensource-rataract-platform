import { MediaType, AnnouncementType } from "@prisma/client";
import { getGoogleDriveDirectLink } from "@/lib/utils";

interface CtaButton {
  label: string;
  url: string;
}

/**
 * Base branded HTML email template layout.
 * Uses table-based layout and inline CSS for wide email client support (Gmail, Outlook).
 */
export function renderHtmlLayout({
  club,
  title,
  preheader,
  contentHtml,
  cta,
  audience = "member",
}: {
  club: any;
  title: string;
  preheader: string;
  contentHtml: string;
  cta?: CtaButton;
  /** "member" (default): existing member/partner + portal-preferences footer. "external": neutral footer with no portal/membership claim, for mail sent to people outside the club. */
  audience?: "member" | "external";
}) {
  const clubName = club?.name || "Rotaract Club";
  const primaryColor = "#D41367"; // THADAM cranberry accent
  const logoUrl = club?.logoUrl;
  const clubEmail = club?.email || "";
  const clubPhone = club?.phone || "";
  const clubAddress = club?.address || "";
  const currentYear = new Date().getFullYear();

  // Email clients can't resolve relative image paths, and can't render a
  // Google Drive "view" page as an image — it needs Drive's direct-serve
  // CDN URL, same conversion every other image in the app goes through.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const directLogoUrl = logoUrl ? getGoogleDriveDirectLink(logoUrl) : null;
  const absoluteLogoUrl = directLogoUrl
    ? directLogoUrl.startsWith("http")
      ? directLogoUrl
      : `${appUrl}${directLogoUrl.startsWith("/") ? "" : "/"}${directLogoUrl}`
    : null;

  // When a logo exists, show it. With no logo we render nothing here — the
  // "Club Notification" title and club name below already identify the sender,
  // so a generic "Rotaract" wordmark would just read as a stray, odd element.
  const logoHeader = absoluteLogoUrl
    ? `<img src="${absoluteLogoUrl}" alt="${clubName}" style="height: 60px; max-height: 60px; width: auto; display: block; margin: 0 auto 16px auto;" />`
    : "";

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style type="text/css">
    body { margin: 0; padding: 0; min-width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F5; }
    .content-table { width: 100%; max-width: 600px; border-spacing: 0; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #E5E7EB; }
  </style>
</head>
<body style="background-color: #FAF8F5; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937; line-height: 1.6;">
  <!-- Hidden preheader text -->
  <div style="display: none; max-height: 0px; overflow: hidden;">${preheader}</div>

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF8F5;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table class="content-table" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
          
          <!-- Cranberry Accent Header Border -->
          <tr>
            <td style="background-color: ${primaryColor}; height: 6px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Logo & Header Section -->
          <tr>
            <td align="center" style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #F3F4F6;">
              ${logoHeader}
              <h2 style="margin: 0; color: ${primaryColor}; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; line-height: 1.2;">${title}</h2>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #6B7280; font-weight: 500;">${clubName}</p>
            </td>
          </tr>

          <!-- Content Block -->
          <tr>
            <td style="padding: 36px 32px; font-size: 15px; color: #1F2937;">
              ${contentHtml}

              <!-- Optional CTA Button -->
              ${cta
      ? `
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0 16px 0;">
                <tr>
                  <td align="center">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="border-radius: 8px; background-color: ${primaryColor};">
                          <a href="${cta.url}" target="_blank" style="font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff; text-decoration: none; border-radius: 8px; padding: 14px 28px; border: 1px solid ${primaryColor}; display: inline-block; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">
                            ${cta.label}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              `
      : ""
    }
            </td>
          </tr>

          <!-- Footer Block -->
          <tr>
            <td style="background-color: #FAF8F5; padding: 32px; text-align: center; border-top: 1px solid #E5E7EB; font-size: 12px; color: #6B7280; font-weight: 500;">
              <p style="margin: 0 0 8px 0;">${audience === "external"
      ? `This email was sent to you directly by <strong>${clubName}</strong>.`
      : `You are receiving this email because you are a member or partner of <strong>${clubName}</strong>.`
    }</p>
              ${clubAddress || clubEmail || clubPhone
      ? `<p style="margin: 0 0 8px 0; color: #9CA3AF;">${[clubAddress, clubPhone, clubEmail].filter(Boolean).join(" · ")}</p>`
      : ""
    }
              <p style="margin: 0; font-size: 11px; color: #9CA3AF;">© ${currentYear} ${clubName}. All rights reserved.</p>
              ${audience === "external"
      ? `<p style="margin: 16px 0 0 0; font-size: 10px; color: #9CA3AF;">If you have questions about this email, please reply directly or contact us using the details above.</p>`
      : `<p style="margin: 16px 0 0 0; font-size: 10px; color: #9CA3AF;">If you no longer wish to receive notifications, you can manage your preferences in the member portal.</p>`
    }
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Returns formatted details list rows for non-null values.
 */
function renderDetailRow(label: string, value: string | null | undefined, isLink = false) {
  if (!value) return "";
  const displayVal = isLink
    ? `<a href="${value}" style="color: #D41367; font-weight: bold; text-decoration: underline;">Join / View Link</a>`
    : value;

  // Label stacked ABOVE value (not side-by-side columns): a fixed label
  // column squeezes the value into one-word-per-line wrapping on narrow
  // phone screens, and email clients can't be trusted with media queries.
  return `
    <tr>
      <td style="padding: 8px 0;">
        <span style="display: block; font-size: 11px; font-weight: bold; color: #D41367; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px;">${label}</span>
        <span style="display: block; font-size: 15px; color: #1F2937; font-weight: 600; line-height: 1.4;">${displayVal}</span>
      </td>
    </tr>
  `;
}

/**
 * Announcement HTML template generator based on Category/Type
 */
export function getAnnouncementHtml(ann: any, club: any, additionalHtml: string = "") {
  const isCustom = ann.type === "CUSTOM" || ann.emailBody?.includes("<!-- CUSTOM_EMAIL -->");
  const rawBody = ann.emailBody || "";
  const cleanBody = rawBody.replace("<!-- CUSTOM_EMAIL -->", "").trim();

  if (isCustom) {
    return renderHtmlLayout({
      club,
      title: "Notice Board Update",
      preheader: ann.title,
      contentHtml: `
        <h3 style="margin-top: 0; margin-bottom: 16px; color: #1F2937; font-size: 18px; font-weight: 800;">${ann.title}</h3>
        <div style="font-size: 15px; color: #374151; line-height: 1.6;">
          ${cleanBody || `<p>${ann.description || "Here is a notice regarding our latest update."}</p>`}
        </div>
        ${additionalHtml}
      `,
    });
  }

  const notesText = rawBody.includes("<!-- NOTES_START -->")
    ? rawBody.split("<!-- NOTES_START -->")[1].trim()
    : "";

  const notesHtml = notesText
    ? `<div style="margin-bottom: 24px;"><p style="font-size: 15px; margin: 0; color: #4B5563; line-height: 1.6; white-space: pre-wrap;">${notesText}</p></div>`
    : "";

  // Pre-formatted Date & Time
  const formattedDate = ann.startDate
    ? new Date(ann.startDate).toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }) + " (IST)"
    : null;

  // Header Title mapping
  let headerTitle = "Club Notification";
  if (ann.type === "BOARD_MEETING") headerTitle = "Board Meeting Invitation";
  if (ann.type === "CLUB_MEETING") headerTitle = "Club Meeting Notice";
  if (ann.type === "EVENT_UPDATE") headerTitle = "Event Update Notice";
  if (ann.type === "FINANCE_NOTICE") headerTitle = "Finance Notice";
  if (ann.type === "IMPORTANT_NOTICE") headerTitle = "Important Club Notice";

  const showDetails = formattedDate || ann.location || ann.meetingLink;
  const descriptionHtml = ann.description
    ? `<div style="margin-bottom: 24px;"><p style="font-size: 15px; margin: 0; color: #4B5563; line-height: 1.6;">${ann.description}</p></div>`
    : "";

  const detailsBlock = showDetails
    ? `
  <div style="background-color: #D4136706; border: 1px solid #D4136715; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      ${renderDetailRow("Topic/Title", ann.title)}
      ${ann.description ? renderDetailRow("Summary", ann.description) : ""}
      ${renderDetailRow("Date & Time", formattedDate)}
      ${renderDetailRow("Location", ann.location)}
      ${renderDetailRow("Online Link", ann.meetingLink, true)}
    </table>
  </div>
  `
    : `
  <div style="margin-bottom: 24px;">
    <h3 style="margin-top: 0; margin-bottom: 8px; color: #1F2937; font-size: 16px; font-weight: 800;">${ann.title}</h3>
    ${ann.description ? `<p style="margin: 0; font-size: 15px; color: #4B5563; line-height: 1.6; white-space: pre-wrap;">${ann.description}</p>` : ""}
  </div>
  `;

  // Attachments Info
  let attachmentsInfo = "";
  if (ann.agendaUrl || ann.minutesUrl || (ann.attachments && ann.attachments.length > 0) || additionalHtml) {
    attachmentsInfo = `
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #F3F4F6;">
        <p style="margin: 0; font-size: 12px; color: #6B7280; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Attachments & Files:</p>
        <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px; color: #4B5563;">
          ${ann.agendaUrl ? `<li>Agenda (See email attachments or links below)</li>` : ""}
          ${ann.minutesUrl ? `<li>Minutes (See email attachments or links below)</li>` : ""}
          ${ann.attachments && Array.isArray(ann.attachments) ? ann.attachments.map((_: any, i: number) => `<li>Attachment File ${i + 1}</li>`).join("") : ""}
        </ul>
        ${additionalHtml}
      </div>
    `;
  }

  // Google Calendar "Add to Calendar" link — always shown when there's a date.
  // This is the guaranteed way to let recipients save the event, regardless of
  // how their email client handles the .ics attachment.
  let googleCalBlock = "";
  if (ann.startDate) {
    const gStart = new Date(ann.startDate);
    const gEnd = ann.endDate ? new Date(ann.endDate) : new Date(gStart.getTime() + 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const calLocation = ann.meetingLink || ann.location || "";
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE`
      + `&text=${encodeURIComponent(ann.title)}`
      + `&dates=${fmt(gStart)}/${fmt(gEnd)}`
      + `&details=${encodeURIComponent(ann.description || ann.title)}`
      + (calLocation ? `&location=${encodeURIComponent(calLocation)}` : "");

    googleCalBlock = `
      <div style="text-align: center; margin-top: 28px; padding-top: 20px; border-top: 1px solid #F3F4F6;">
        <a href="${gcalUrl}" target="_blank" rel="noopener noreferrer"
           style="display: inline-flex; align-items: center; gap: 6px; color: #4285F4; font-size: 13px; font-weight: 700; text-decoration: none;">
          📅 Add to Google Calendar
        </a>
      </div>
    `;
  }

  const cta = ann.meetingLink ? { label: "Join Meeting", url: ann.meetingLink } : undefined;

  return renderHtmlLayout({
    club,
    title: headerTitle,
    preheader: ann.title,
    contentHtml: `
      ${detailsBlock}
      ${notesHtml}
      ${attachmentsInfo}
      ${googleCalBlock}
    `,
    cta,
  });
}

/**
 * OTP / Verification HTML template
 */
export function getOtpEmailHtml(code: string, club: any) {
  return renderHtmlLayout({
    club,
    title: "Verify Admin Access",
    preheader: `Your verification code is ${code}`,
    contentHtml: `
      <p style="font-size: 15px; margin-top: 0; margin-bottom: 20px; color: #1F2937;">Hello,</p>
      <p style="font-size: 15px; margin-bottom: 24px; color: #4B5563; line-height: 1.6;">
        Please use the verification code below to authorize your admin login. This code is only valid for 10 minutes.
      </p>
      
      <div style="background-color: #FAF8F5; padding: 24px; border-radius: 16px; text-align: center; border: 1px dashed #D41367; margin-bottom: 24px;">
        <span style="font-size: 36px; font-weight: 900; letter-spacing: 0.25em; color: #D41367; padding-left: 0.25em; display: inline-block;">${code}</span>
      </div>
      
      <p style="color: #9CA3AF; font-size: 11px; margin-bottom: 0; padding-top: 16px; border-top: 1px solid #F3F4F6;">
        If you did not request this verification, you can safely ignore this email.
      </p>
    `,
  });
}

/**
 * Event Invite HTML template
 */
export function getEventInviteEmailHtml(event: any, memberName: string, club: any, googleCalUrl?: string) {
  const start = new Date(event.startDate);
  const formattedDate = start.toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }) + " (IST)";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const eventUrl = `${appUrl}/events/${event.slug}`;
  const cta = { label: "View Event Details & RSVP", url: eventUrl };

  const detailsBlock = `
    <div style="background-color: #D4136706; border: 1px solid #D4136715; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        ${renderDetailRow("Event", event.title)}
        ${renderDetailRow("Date & Time", formattedDate)}
        ${renderDetailRow("Location", event.location)}
        ${renderDetailRow("Online Link", event.meetingLink, true)}
      </table>
    </div>
  `;

  const descriptionBlock = event.description
    ? `
    <div style="margin-bottom: 24px;">
      <h4 style="margin: 0 0 8px 0; color: #1F2937; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">About the Event</h4>
      <p style="margin: 0; font-size: 14px; color: #4B5563; line-height: 1.6; white-space: pre-wrap;">${event.description}</p>
    </div>
  `
    : "";

  const googleCalBlock = googleCalUrl
    ? `
    <div style="text-align: center; border-top: 1px solid #F3F4F6; padding-top: 16px; margin-top: 24px;">
      <a href="${googleCalUrl}" target="_blank" rel="noopener noreferrer" style="color: #D41367; font-size: 12px; font-weight: 700; text-decoration: underline; display: inline-block;">
        + Add to Google Calendar
      </a>
    </div>
  `
    : "";

  return renderHtmlLayout({
    club,
    title: "Event Invitation",
    preheader: `You are invited to ${event.title}`,
    contentHtml: `
      <p style="font-size: 15px; margin-top: 0; margin-bottom: 20px; color: #1F2937;">Hi ${memberName},</p>
      <p style="font-size: 15px; margin-bottom: 24px; color: #4B5563; line-height: 1.6;">
        You are cordially invited to attend our upcoming event. Here are the details:
      </p>
      ${detailsBlock}
      ${descriptionBlock}
      ${googleCalBlock}
    `,
    cta,
  });
}

/**
 * Reset Password HTML template
 */
export function getPasswordResetEmailHtml(resetUrl: string, club: any) {
  return renderHtmlLayout({
    club,
    title: "Reset Your Password",
    preheader: "Request to reset password",
    contentHtml: `
      <p style="font-size: 15px; margin-top: 0; margin-bottom: 20px; color: #1F2937;">Hello,</p>
      <p style="font-size: 15px; margin-bottom: 24px; color: #4B5563; line-height: 1.6;">
        We received a request to reset your password for your portal account. Click the button below to set a new password. This link will expire in 2 hours.
      </p>
      <p style="color: #9CA3AF; font-size: 11px; margin-bottom: 0; padding-top: 16px; border-top: 1px solid #F3F4F6;">
        If you did not request a password reset, you can safely ignore this email.
      </p>
    `,
    cta: { label: "Reset Password", url: resetUrl },
  });
}

/**
 * Transaction Receipt / Payment HTML template
 */
export function getTransactionReceiptEmailHtml(transaction: any, club: any) {
  const formattedDate = transaction.date
    ? new Date(transaction.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "TBD";

  const detailsBlock = `
    <div style="background-color: #D4136706; border: 1px solid #D4136715; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        ${renderDetailRow("Transaction ID", transaction.id)}
        ${renderDetailRow("Amount", `₹${transaction.amount}`)}
        ${renderDetailRow("Status", transaction.status)}
        ${renderDetailRow("Description", transaction.description)}
        ${renderDetailRow("Category", transaction.category)}
        ${renderDetailRow("Date", formattedDate)}
      </table>
    </div>
  `;

  const statusTitle = transaction.status === "APPROVED" ? "Payment Approved" : "Payment Rejected";

  return renderHtmlLayout({
    club,
    title: `Payment Notice — ${statusTitle}`,
    preheader: `Your payment request for ₹${transaction.amount} has been ${transaction.status.toLowerCase()}`,
    contentHtml: `
      <p style="font-size: 15px; margin-top: 0; margin-bottom: 20px; color: #1F2937;">Hi ${transaction.user?.name || "Member"},</p>
      <p style="font-size: 15px; margin-bottom: 24px; color: #4B5563; line-height: 1.6;">
        Your payment request has been processed by the finance team. Details are shown below:
      </p>
      ${detailsBlock}
      <p style="font-size: 14px; color: #4B5563;">You can view more logs or submit inquiries in your member portal.</p>
    `,
  });
}

/**
 * Partner Inquiry Submission HTML template
 */
export function getPartnerReplyEmailHtml(inquiry: any, club: any) {
  const detailsBlock = `
    <div style="background-color: #D4136706; border: 1px solid #D4136715; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        ${renderDetailRow("Name", inquiry.name)}
        ${renderDetailRow("Email", inquiry.email)}
        ${renderDetailRow("Phone", inquiry.phone || "Not provided")}
        ${renderDetailRow("Company", inquiry.company || "Not provided")}
        ${renderDetailRow("Pledge Topic", inquiry.subject)}
      </table>
    </div>
  `;

  return renderHtmlLayout({
    club,
    title: "New Partnership / Sponsorship Inquiry",
    preheader: `Sponsorship pledge inquiry from ${inquiry.name}`,
    contentHtml: `
      <p style="font-size: 15px; margin-top: 0; margin-bottom: 20px; color: #1F2937;">Hello Team,</p>
      <p style="font-size: 15px; margin-bottom: 24px; color: #4B5563; line-height: 1.6;">
        You have received a new inquiry from the public website for <strong>${club?.name || "the club"}</strong>:
      </p>
      ${detailsBlock}
      <div style="background-color: #FAF8F5; padding: 16px; border-radius: 8px; border: 1px solid #E5E7EB; margin-top: 16px; margin-bottom: 24px;">
        <span style="font-size: 10px; font-weight: bold; color: #6B7280; text-transform: uppercase;">Message Content:</span>
        <p style="font-size: 14px; color: #1F2937; line-height: 1.6; margin: 8px 0 0 0; white-space: pre-wrap;">${inquiry.message}</p>
      </div>
    `,
  });
}

/**
 * External outreach email — a club message sent to a non-member recipient
 * (sponsor, vendor, guest, etc.), authored via an external mail request.
 */
export function getExternalMailHtml(recipientName: string, body: string, club: any) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => `<p style="font-size: 15px; color: #1F2937; line-height: 1.7; margin: 0 0 16px 0; white-space: pre-wrap;">${p}</p>`)
    .join("");
  return renderHtmlLayout({
    club,
    title: club?.name || "Rotaract Club",
    preheader: body.slice(0, 120),
    audience: "external",
    contentHtml: `
      <p style="font-size: 15px; margin-top: 0; margin-bottom: 20px; color: #1F2937;">Dear ${recipientName},</p>
      ${paragraphs}
    `,
  });
}

/**
 * Generic notification template fallback
 */
export function getNotificationEmailHtml(subject: string, body: string, memberName: string, club: any) {
  const personalBody = body.replace(/{{memberName}}/g, memberName);
  return renderHtmlLayout({
    club,
    title: "Club Update",
    preheader: subject,
    contentHtml: `
      <p style="font-size: 15px; margin-top: 0; margin-bottom: 20px; color: #1F2937;">Hi ${memberName},</p>
      <div style="font-size: 15px; color: #4B5563; line-height: 1.6;">
        ${personalBody}
      </div>
    `,
  });
}
