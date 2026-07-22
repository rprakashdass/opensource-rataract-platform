import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes conditionally using `clsx` and `tailwind-merge`.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Retrieves the current year from the environment variable `CURRENT_YEAR`.
 * If not set, defaults to the system's current year.
 */
export const currentYear: number =
  Number(process.env.CURRENT_YEAR) || new Date().getFullYear();

/**
 * Resolves a Google Drive web view link into a direct displayable image link using Google User Content CDN.
 */
export function getGoogleDriveDirectLink(url: string | null | undefined): string {
  if (!url) return "";
  const match = url.match(/(?:id=|\/d\/|file\/d\/)([\w-]{25,})/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return url;
}

/**
 * Aggregates board memberships into a single formatted designation string (e.g., "President & Treasurer").
 * Filters out memberships that have `leftAt` set or where the financial year is not ACTIVE.
 */
export function formatDesignations(
  boardMemberships?: { position: string; leftAt?: Date | null; financialYear?: { status: string } }[]
): string | null {
  if (!boardMemberships || boardMemberships.length === 0) return null;

  const activePositions = boardMemberships
    .filter((b) => !b.leftAt && (!b.financialYear || b.financialYear.status === "ACTIVE"))
    .map((b) => b.position);

  if (activePositions.length === 0) return null;

  // e.g. ["President", "Treasurer", "Director"] -> "President, Treasurer & Director"
  if (activePositions.length === 1) return activePositions[0];
  if (activePositions.length === 2) return activePositions.join(" & ");
  
  const last = activePositions.pop();
  return `${activePositions.join(", ")} & ${last}`;
}
