import { getCurrentClub } from "@/lib/club";
import { getTemplate } from "@/features/communication/services/templateService";
import { EmailTemplateType } from "@prisma/client";
import { TemplateForm } from "@/features/communication/components/TemplateForm";

export default async function TemplatesPage() {
  const club = await getCurrentClub();
  if (!club) return <div>Club not found</div>;

  const eventPublished = await getTemplate(club.id, "EVENT_PUBLISHED");
  const eventUpdated = await getTemplate(club.id, "EVENT_UPDATED");
  const eventReminder = await getTemplate(club.id, "EVENT_REMINDER");
  const projectPublished = await getTemplate(club.id, "PROJECT_PUBLISHED");
  const announcementPublished = await getTemplate(club.id, "ANNOUNCEMENT_PUBLISHED");
  const attendanceConfirmed = await getTemplate(club.id, "ATTENDANCE_CONFIRMED");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
        <p className="text-gray-500">Manage the default email templates used for automated communications.</p>
      </div>

      <div className="space-y-6">
        <TemplateForm 
          type="EVENT_PUBLISHED" 
          label="Event Published" 
          initialSubject={eventPublished.subjectTemplate}
          initialBody={eventPublished.bodyTemplate}
          initialEnabled={eventPublished.enabled}
        />
        
        <TemplateForm 
          type="EVENT_UPDATED" 
          label="Event Updated" 
          initialSubject={eventUpdated.subjectTemplate}
          initialBody={eventUpdated.bodyTemplate}
          initialEnabled={eventUpdated.enabled}
        />
        
        <TemplateForm 
          type="EVENT_REMINDER" 
          label="Event Reminder" 
          initialSubject={eventReminder.subjectTemplate}
          initialBody={eventReminder.bodyTemplate}
          initialEnabled={eventReminder.enabled}
        />

        <TemplateForm 
          type="PROJECT_PUBLISHED" 
          label="Project Published" 
          initialSubject={projectPublished.subjectTemplate}
          initialBody={projectPublished.bodyTemplate}
          initialEnabled={projectPublished.enabled}
        />

        <TemplateForm 
          type="ANNOUNCEMENT_PUBLISHED" 
          label="Announcement Published" 
          initialSubject={announcementPublished.subjectTemplate}
          initialBody={announcementPublished.bodyTemplate}
          initialEnabled={announcementPublished.enabled}
        />

        <TemplateForm 
          type="ATTENDANCE_CONFIRMED" 
          label="Attendance Confirmed" 
          initialSubject={attendanceConfirmed.subjectTemplate}
          initialBody={attendanceConfirmed.bodyTemplate}
          initialEnabled={attendanceConfirmed.enabled}
        />
      </div>
    </div>
  );
}
