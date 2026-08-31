/**
 * Best-effort greeting name from an email's local-part, e.g.
 * "john.sharma123@x.com" -> "John Sharma". Falls back to "Sir/Madam"
 * when nothing usable is left (no public lookup exists for a bare email).
 */
export function deriveNameFromEmail(email: string): string {
  const localPart = email.split("@")[0] || "";
  const words = localPart
    .split(/[._\-+]+/)
    .map((w) => w.replace(/\d+/g, ""))
    .filter(Boolean);

  if (words.length === 0) return "Sir/Madam";

  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}
