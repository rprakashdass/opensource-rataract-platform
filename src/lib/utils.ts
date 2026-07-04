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
