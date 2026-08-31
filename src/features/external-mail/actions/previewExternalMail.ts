"use server";

import { getSession } from "@/lib/auth/session";
import { getCurrentClub } from "@/lib/club";
import { getExternalMailHtml } from "@/lib/email-templates";

export async function previewExternalMailHtml(
  greetingName: string,
  body: string
): Promise<{ html: string; error?: undefined } | { html?: undefined; error: string }> {
  const session = await getSession();
  if (!session?.id) return { error: "Unauthorized" };

  const club = await getCurrentClub();
  if (!club) return { error: "Club not found" };

  const html = getExternalMailHtml(greetingName || "Sir/Madam", body || "", club);
  return { html };
}
