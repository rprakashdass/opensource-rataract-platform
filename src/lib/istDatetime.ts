const IST_OFFSET = "+05:30";

/**
 * Converts a <input type="datetime-local"> value ("YYYY-MM-DDTHH:mm", no
 * timezone) into a correct UTC ISO string, treating the wall-clock value as
 * India Standard Time — regardless of the browser or server's own timezone.
 *
 * `new Date(value).toISOString()` is NOT equivalent: it interprets `value`
 * using the runtime's ambient timezone, which silently produces the wrong
 * instant whenever that runtime isn't IST (e.g. a UTC-configured server, or
 * an admin's browser/OS not set to India time).
 */
export function istInputToISOString(value: string): string {
  const withSeconds = value.length === 16 ? `${value}:00` : value;
  return new Date(`${withSeconds}${IST_OFFSET}`).toISOString();
}

/**
 * Converts a stored Date/ISO instant into the "YYYY-MM-DDTHH:mm" wall-clock
 * form a <input type="datetime-local"> expects, rendered in IST — regardless
 * of the browser's own timezone.
 */
export function isoToISTInputValue(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
