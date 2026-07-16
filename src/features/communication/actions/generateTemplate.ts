"use server";

export async function generateTemplate(data: {
  type: string;
  title?: string;
  date?: string;
  location?: string;
  link?: string;
}) {
  let emailSubject = '';
  let emailBody = '';
  let agendaContent = '';

  const titleStr = data.title || '[Topic / Title]';
  const formattedDate = data.date ? new Date(data.date).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }) : '[Date & Time]';

  const venueStr = data.location || '[Meeting Venue]';
  const linkStr = data.link ? `\n- **Meeting Link:** [Join Here](${data.link})` : '';

  if (data.type === 'BOARD_MEETING') {
    emailSubject = `Notice of Board Meeting: ${titleStr}`;
    emailBody = `Dear Board Members,

You are cordially invited to our upcoming Board Meeting.

**Meeting Details:**
- **Agenda:** ${titleStr}
- **Date & Time:** ${formattedDate}
- **Venue:** ${venueStr}${linkStr}

Please review the agenda and come prepared to discuss your respective avenues.

Yours in Rotaract,
Secretary`;
    agendaContent = `**Agenda for ${titleStr}**\n\n1. Call to order\n2. Roll call & apologies\n3. Review & approval of previous minutes\n4. President's remarks\n5. Avenue/Portfolio updates\n6. Special agenda discussions\n7. Any other business (AOB)\n8. Adjournment`;
  } else if (data.type === 'CLUB_MEETING') {
    emailSubject = `Club Meeting Notice: ${titleStr}`;
    emailBody = `Dear Members,

Please join us for our upcoming general body meeting!

**Meeting Details:**
- **Topic:** ${titleStr}
- **Date & Time:** ${formattedDate}
- **Venue:** ${venueStr}${linkStr}

Looking forward to seeing you all!

Yours in Rotaract,
Joint Secretary`;
    agendaContent = `**Agenda**\n\n1. Fellowship & Welcome\n2. Project updates\n3. Financial highlights\n4. Upcoming plan overview\n5. Member spotlight`;
  } else if (data.type === 'EVENT_UPDATE') {
    emailSubject = `Important Event Update: ${titleStr}`;
    emailBody = `Dear Members and Partners,

We have an exciting update regarding our upcoming event: **${titleStr}**.

**Event Details:**
- **Date & Time:** ${formattedDate}
- **Venue:** ${venueStr}${linkStr}

Please read the details and make sure to RSVP and spread the word!

Best regards,
Event Committee`;
  } else if (data.type === 'FINANCE_NOTICE') {
    emailSubject = `Important Finance Update: ${titleStr}`;
    emailBody = `Dear Members,

Please take note of this financial notice:

**${titleStr}**

Kindly review the details and ensure all dues/payments are cleared by the deadline.

Regards,
Treasurer`;
  } else if (data.type === 'IMPORTANT_NOTICE') {
    emailSubject = `URGENT NOTICE: ${titleStr}`;
    emailBody = `Dear Members,

Please read this urgent and important notice regarding:

**${titleStr}**

Ensure you read the attachment and respond if necessary.

Best regards,
President`;
  } else {
    emailSubject = `Rotaract Club Update: ${titleStr}`;
    emailBody = `Dear Members,

Here is a general update regarding our club activities:

**${titleStr}**

Thank you for your active participation.

Best regards,
Rotaract Club`;
  }

  return { emailSubject, emailBody, agendaContent };
}
