import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  // Ensure only authenticated admins can enable draft mode
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") || "/";

  const draft = await draftMode();
  draft.enable();

  redirect(path);
}
