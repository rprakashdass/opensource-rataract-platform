/**
 * Shared passport/membership-card stats so the on-page card (ProfileJourneyClient)
 * and the shareable image route compute identical numbers. Keep the tiers here in
 * sync — this is the single source of truth for a member's "rank".
 */

export interface PassportStats {
  totalHours: number;
  totalEvents: number;
  totalProjects: number;
  awards: number;
  stars: number;
  statusBadge: string;
  memberSince: number | null;
  profileCompletion: number;
}

export function computePassportStats(member: any): PassportStats {
  const totalHours =
    member?.attendance?.reduce(
      (acc: number, curr: any) => acc + Number(curr.volunteerHours || 0),
      0
    ) || 0;
  const totalEvents = member?.attendance?.length || 0;
  const totalProjects = member?.projectRoles?.length || 0;
  const awards =
    member?.attendance?.filter((a: any) => a.certificateUrl)?.length || 0;

  // Profile completion — same weights as the profile page.
  const profileFields = [
    { value: member?.avatar, weight: 15 },
    { value: member?.phone, weight: 15 },
    { value: member?.emergencyContact, weight: 15 },
    { value: member?.bloodGroup, weight: 15 },
    { value: member?.bio, weight: 20 },
    { value: member?.skills?.length > 0, weight: 20 },
  ];
  const profileCompletion = profileFields.reduce(
    (acc, curr) => (curr.value ? acc + curr.weight : acc),
    0
  );

  // Status tiers.
  let statusBadge = "New Contributor";
  let stars = 1;
  if (totalHours > 80 || totalEvents > 15) {
    statusBadge = "Elite Ambassador";
    stars = 5;
  } else if (totalHours > 40 || totalEvents > 8) {
    statusBadge = "Active Contributor";
    stars = 3;
  } else if (totalHours > 10 || totalEvents > 2) {
    statusBadge = "Dedicated Member";
    stars = 2;
  }

  const memberSince = member?.createdAt
    ? new Date(member.createdAt).getFullYear()
    : null;

  return {
    totalHours,
    totalEvents,
    totalProjects,
    awards,
    stars,
    statusBadge,
    memberSince,
    profileCompletion,
  };
}
