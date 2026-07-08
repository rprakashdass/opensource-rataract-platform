"use server";

export async function generateTemplate(data: {
  type: string;
  title: string;
  date?: string;
  location?: string;
  link?: string;
}) {
  let emailSubject = '';
  let emailBody = '';
  let agendaContent = '';

  const formattedDate = data.date ? new Date(data.date).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }) : 'TBD';

  if (data.type === 'BOARD_MEETING') {
    emailSubject = `Board Meeting: ${data.title}`;
    emailBody = `Dear Board Members,

You are invited to our upcoming Board Meeting.

**Meeting Details:**
- **Topic:** ${data.title}
- **Date & Time:** ${formattedDate}
- **Venue:** ${data.location || 'TBD'}
${data.link ? `- **Meeting Link:** [Join Here](${data.link})` : ''}

Please review the agenda and come prepared to discuss your respective avenues.

Yours in Rotaract,
Secretary`;
    agendaContent = `**Agenda for ${data.title}**\n\n1. Call to order\n2. Roll call\n3. Review of previous minutes\n4. President's remarks\n5. Avenue reports\n6. Any other business (AOB)\n7. Adjournment`;
  } else if (data.type === 'CLUB_MEETING') {
    emailSubject = `Club Meeting: ${data.title}`;
    emailBody = `Dear Members,

Join us for our upcoming general body meeting!

**Meeting Details:**
- **Topic:** ${data.title}
- **Date & Time:** ${formattedDate}
- **Venue:** ${data.location || 'TBD'}

Looking forward to seeing you all!

Yours in Rotaract,
President`;
    agendaContent = `**Agenda**\n\n1. Welcome Address\n2. Project Updates\n3. Upcoming Events\n4. Member Spotlight\n5. Fellowship`;
  } else if (data.type === 'FINANCE_NOTICE') {
    emailSubject = `Important Finance Update: ${data.title}`;
    emailBody = `Dear Members,

Please take note of this financial update:

**${data.title}**

Kindly review the details and ensure all dues/payments are cleared on time.

Regards,
Treasurer`;
  } else {
    emailSubject = `Announcement: ${data.title}`;
    emailBody = `Dear Members,

We have an important announcement regarding: **${data.title}**

Date: ${formattedDate}
${data.location ? `Location: ${data.location}` : ''}

Best regards,
Rotaract Club`;
  }

  return { emailSubject, emailBody, agendaContent };
}
