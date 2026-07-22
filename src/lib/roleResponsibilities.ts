/**
 * Canonical Rotaract role → responsibilities reference.
 *
 * Board positions are stored as free-form strings (ClubRole.name /
 * BoardMembership.position), so this is the one place that maps a role name to
 * what it actually does. Look up with getRoleResponsibilities(name) — it
 * normalizes casing, underscores, punctuation and common abbreviations, and
 * returns null for roles we don't have copy for (custom club roles), so callers
 * can simply hide the block when there's no match.
 */

export interface RoleResponsibilities {
  title: string;
  /** One-line gist (first responsibility). */
  summary: string;
  /** Full duty list. */
  points: string[];
}

const ROLES: { title: string; aliases?: string[]; points: string[] }[] = [
  {
    title: "President",
    points: [
      "Leads the club's overall vision, strategy, and direction for the term.",
      "Oversees all committees and ensures alignment with Rotaract/Rotary International guidelines.",
      "Chairs board meetings and represents the club at district and external events.",
      "Holds final accountability for club performance and culture.",
    ],
  },
  {
    title: "Vice President",
    aliases: ["vp"],
    points: [
      "Supports the President in daily operations and steps in during their absence.",
      "Coordinates between committees to ensure smooth execution of plans.",
      "Often oversees specific projects or portfolios delegated by the President.",
      "Helps maintain continuity and internal club discipline.",
    ],
  },
  {
    title: "Secretary Administration",
    aliases: ["secretary admin", "admin secretary", "general secretary"],
    points: [
      "Maintains official records, meeting minutes, and club documentation.",
      "Manages correspondence, attendance tracking, and administrative compliance.",
      "Coordinates scheduling of meetings and internal communications.",
      "Ensures the club meets reporting requirements to Rotary/Rotaract district bodies.",
    ],
  },
  {
    title: "Secretary Communication",
    aliases: ["communication secretary", "comm secretary"],
    points: [
      "Manages internal and external communication flow for the club.",
      "Drafts and disseminates official announcements, circulars, and updates.",
      "Liaises with media/social handles to ensure consistent messaging.",
      "Bridges communication gaps between members, admin, and leadership.",
    ],
  },
  {
    title: "Treasurer",
    points: [
      "Manages the club's finances, budgeting, and expense tracking.",
      "Maintains transaction records and prepares financial reports.",
      "Ensures timely collection of dues and proper fund utilization.",
      "Provides financial transparency and accountability to the board and members.",
    ],
  },
  {
    title: "Public Relations Officer",
    aliases: ["public relation officer", "pro"],
    points: [
      "Builds and manages the club's public image and external relationships.",
      "Handles media outreach, press coverage, and community perception.",
      "Coordinates with sponsors, partners, and other clubs for visibility.",
      "Represents the club's brand voice in public-facing engagements.",
    ],
  },
  {
    title: "Social Media Handle",
    aliases: ["social media", "social media chair", "social media lead"],
    points: [
      "Manages the club's presence across social media platforms.",
      "Creates and schedules content to promote events and achievements.",
      "Engages with followers and monitors online reputation.",
      "Tracks analytics to improve outreach and engagement.",
    ],
  },
  {
    title: "Editorial Chair",
    aliases: ["editor", "editorial"],
    points: [
      "Oversees creation of newsletters, bulletins, and written club content.",
      "Edits and proofreads materials for quality and consistency.",
      "Documents club activities and achievements for archives.",
      "Ensures storytelling aligns with club values and branding.",
    ],
  },
  {
    title: "Rotary Learning Facilitator",
    aliases: ["learning facilitator", "rlf"],
    points: [
      "Educates members on Rotaract/Rotary history, values, and processes.",
      "Conducts training sessions and onboarding for new members.",
      "Keeps the club updated on Rotary International policies and programs.",
      "Encourages personal and leadership development among members.",
    ],
  },
  {
    title: "Young Leader Contact",
    aliases: ["ylc"],
    points: [
      "Serves as liaison between the club and youth/young leader programs.",
      "Identifies and nurtures potential young talent for leadership roles.",
      "Coordinates mentorship and skill-building initiatives.",
      "Bridges Rotaract with Interact or younger community groups.",
    ],
  },
  {
    title: "International Service",
    aliases: ["international service director", "director international service"],
    points: [
      "Plans and executes projects with global or cross-border impact.",
      "Coordinates with international Rotary/Rotaract clubs for collaboration.",
      "Raises awareness on global issues (health, environment, education).",
      "Facilitates international exchange or twinning programs.",
    ],
  },
  {
    title: "Community Service",
    aliases: ["community service director", "director community service"],
    points: [
      "Designs and implements local community welfare projects.",
      "Identifies community needs and mobilizes volunteers for action.",
      "Partners with NGOs and local bodies for sustainable impact.",
      "Tracks and reports outcomes of service initiatives.",
    ],
  },
  {
    title: "Professional Service",
    aliases: ["professional service director", "director professional service"],
    points: [
      "Organizes initiatives that build members' professional/career skills.",
      "Coordinates workshops, guest talks, and skill-development sessions.",
      "Connects members with professional networking opportunities.",
      "Promotes ethical and professional growth within the club.",
    ],
  },
  {
    title: "Club Service",
    aliases: ["club service director", "director club service"],
    points: [
      "Focuses on strengthening internal club engagement and bonding.",
      "Plans club-level events, fellowship activities, and celebrations.",
      "Ensures smooth day-to-day functioning of club operations.",
      "Boosts member satisfaction and participation.",
    ],
  },
  {
    title: "DPP",
    aliases: [
      "dpp",
      "district directorate of public project planning",
      "director public project planning",
    ],
    points: [
      "Plans and documents projects in line with district guidelines.",
      "Ensures project proposals meet required formats and deadlines.",
      "Tracks project execution timelines and deliverables.",
      "Liaises with the district team for approvals and reporting.",
    ],
  },
  {
    title: "Membership Chair",
    aliases: ["membership", "membership director"],
    points: [
      "Drives recruitment and retention of club members.",
      "Organizes onboarding and induction for new recruits.",
      "Tracks membership growth and engagement metrics.",
      "Addresses member concerns to reduce attrition.",
    ],
  },
  {
    title: "All Avenue",
    aliases: ["all avenues"],
    points: [
      "Oversees miscellaneous or cross-functional initiatives not tied to one avenue.",
      "Supports other portfolios wherever gaps exist.",
      "Acts as a flexible resource across service, professional, and club activities.",
      "Ensures no initiative falls through organizational cracks.",
    ],
  },
  {
    title: "Blood Donor Cell",
    aliases: ["blood donation cell", "blood bank"],
    points: [
      "Organizes and manages blood donation camps and drives.",
      "Maintains donor databases and coordinates with blood banks/hospitals.",
      "Raises awareness on the importance of regular blood donation.",
      "Ensures safety and logistics compliance during donation events.",
    ],
  },
  {
    title: "The Rotary Foundation",
    aliases: ["rotary foundation", "trf"],
    points: [
      "Educates members about Rotary Foundation's mission and grants.",
      "Coordinates fundraising and contributions toward foundation programs.",
      "Tracks and reports foundation-related giving from the club.",
      "Connects local projects to foundation grant opportunities.",
    ],
  },
  {
    title: "Director of Operations",
    aliases: ["operations director", "operations", "director operations"],
    points: [
      "Oversees the operational execution of club projects and events.",
      "Ensures logistics, resources, and timelines are well managed.",
      "Coordinates between different committees for smooth delivery.",
      "Troubleshoots operational bottlenecks during execution.",
    ],
  },
  {
    title: "Sergeant at Arms",
    aliases: ["saa", "sergeant-at-arms"],
    points: [
      "Maintains discipline, order, and decorum during meetings/events.",
      "Manages logistics like seating, timing, and meeting protocol.",
      "Enforces club rules and etiquette among members.",
      "Acts as the point of contact for meeting-day coordination.",
    ],
  },
  {
    title: "Club Advisor",
    aliases: ["advisor", "mentor"],
    points: [
      "Provides mentorship and guidance to the club's leadership team.",
      "Offers experienced perspective on decisions and conflict resolution.",
      "Ensures the club adheres to Rotary/Rotaract's broader mission.",
      "Acts as a bridge between the club and senior Rotary members.",
    ],
  },
];

/** Normalize for matching: lowercase, & → and, strip punctuation, collapse spaces. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Build the lookup index once (title + aliases).
const INDEX = new Map<string, RoleResponsibilities>();
for (const role of ROLES) {
  const entry: RoleResponsibilities = {
    title: role.title,
    summary: role.points[0],
    points: role.points,
  };
  INDEX.set(normalize(role.title), entry);
  for (const alias of role.aliases ?? []) INDEX.set(normalize(alias), entry);
}

/**
 * Resolve a role/position name to its responsibilities, or null if unknown.
 * Tries exact normalized match, then a contained-phrase match (so
 * "Community Service Director" resolves to "Community Service").
 */
export function getRoleResponsibilities(
  name?: string | null
): RoleResponsibilities | null {
  if (!name) return null;
  const key = normalize(name);
  if (!key) return null;

  const exact = INDEX.get(key);
  if (exact) return exact;

  // Fuzzy: the stored name contains a known role, or vice-versa.
  for (const [indexed, entry] of INDEX) {
    if (key.includes(indexed) || indexed.includes(key)) return entry;
  }
  return null;
}
