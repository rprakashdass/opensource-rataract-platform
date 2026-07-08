import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function getMemberDashboard() {
  try {
    const session = await getSession();
    if (!session || !session.id) return { error: "Unauthorized" };

    const basicMember = await prisma.member.findUnique({
      where: { userId: session.id },
      select: { id: true }
    });

    if (!basicMember) return { error: "Member profile not found." };

    const member = await prisma.member.findUnique({
      where: { id: basicMember.id },
      include: {
        club: true,
        registrations: {
          include: { 
              event: {
                  include: {
                      attendanceSessions: {
                          where: { active: true, expiresAt: { gt: new Date() } }
                      },
                      attendance: {
                          where: { memberId: basicMember.id }
                      }
                  }
              } 
          },
          orderBy: { createdAt: 'desc' }
        },
        attendance: {
          include: { event: true },
          orderBy: { checkedInAt: 'desc' }
        },
        projectRoles: {
          include: { project: true },
          orderBy: { joinedAt: 'desc' }
        },
        boardMemberships: {
            include: { financialYear: true },
            orderBy: { joinedAt: 'desc' }
        }
      }
    });

    if (!member) return { error: "Member profile not found." };

    // Calculate profile completion
    let completedFields = 0;
    const totalFields = 6;
    if (member.avatar) completedFields++;
    if (member.phone) completedFields++;
    if (member.emergencyContact) completedFields++;
    if (member.bloodGroup) completedFields++;
    if (member.skills && member.skills.length > 0) completedFields++;
    if (member.bio) completedFields++;

    const profileCompletion = Math.round((completedFields / totalFields) * 100);

    // Calculate Stats
    const eventsAttended = member.attendance.length;
    const volunteerHours = member.attendance.reduce((acc, curr) => acc + Number(curr.volunteerHours || 0), 0);
    const projectsJoined = member.projectRoles.length;
    
    // Find upcoming registered events
    const upcomingEvents = member.registrations
      .map(r => r.event)
      .filter(e => {
          const eventEnd = e.endTime 
              ? new Date(e.endTime) 
              : new Date(new Date(e.startTime).setHours(23, 59, 59, 999));
          return eventEnd > new Date() && e.status !== "CANCELLED" && e.status !== "COMPLETED";
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    // Find events available for check-in TODAY
    const checkInEvents = member.registrations
      .map(r => r.event)
      .filter(e => e.attendanceSessions.length > 0 && e.attendance.length === 0);

    // Build Activity Timeline
    const timeline: any[] = [];

    // Add Attendance to timeline
    member.attendance.forEach(att => {
        timeline.push({
            id: `att_${att.id}`,
            date: att.checkedInAt,
            title: `Attended ${att.event.title}`,
            description: att.volunteerHours ? `+${att.volunteerHours} volunteer hours` : "",
            type: "ATTENDANCE"
        });
    });

    // Add Registrations to timeline
    member.registrations.forEach(reg => {
        timeline.push({
            id: `reg_${reg.id}`,
            date: reg.createdAt,
            title: `Registered for ${reg.event.title}`,
            description: "",
            type: "REGISTRATION"
        });
    });

    // Add Project Memberships
    member.projectRoles.forEach(pm => {
        timeline.push({
            id: `proj_${pm.id}`,
            date: pm.joinedAt,
            title: `Joined ${pm.project.title}`,
            description: `Role: ${pm.role.toLowerCase()}`,
            type: "PROJECT"
        });
    });

    // Add Board Memberships
    member.boardMemberships.forEach(bm => {
        timeline.push({
            id: `board_${bm.id}`,
            date: bm.joinedAt,
            title: `Appointed as ${bm.position.replaceAll("_", " ")}`,
            description: `Financial Year: ${bm.financialYear.name}`,
            type: "BOARD"
        });
    });

    // Sort timeline descending
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { 
        member,
        profileCompletion,
        stats: {
            eventsAttended,
            volunteerHours,
            projectsJoined,
            upcomingCount: upcomingEvents.length
        },
        upcomingEvents,
        checkInEvents,
        timeline: timeline.slice(0, 20) // Latest 20 activities
    };
  } catch (error: any) {
    console.error("Dashboard error:", error);
    return { error: "Failed to load dashboard data." };
  }
}
