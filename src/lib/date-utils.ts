import { formatInTimeZone } from 'date-fns-tz';

export const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Formats a date (string, number, or Date) to IST using a specific format string.
 * Example format: "MMM dd, yyyy 'at' hh:mm a"
 */
export function formatIST(date: string | number | Date, formatStr: string): string {
  if (!date) return '';
  try {
    return formatInTimeZone(new Date(date), IST_TIMEZONE, formatStr);
  } catch (e) {
    return '';
  }
}

/**
 * Common formatting: "3/12/2024, 2:30:00 PM" (similar to toLocaleString default)
 */
export function toLocaleStringIST(date: string | number | Date): string {
  return formatIST(date, "M/d/yyyy, h:mm:ss a");
}

/**
 * Common formatting for Dates only (similar to toLocaleDateString default)
 */
export function toLocaleDateStringIST(date: string | number | Date): string {
  return formatIST(date, "M/d/yyyy");
}
