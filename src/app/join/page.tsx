import { getCurrentClub } from "@/lib/club";
import { notFound } from "next/navigation";
import { getOrCreateWebsiteSettings } from "@/features/public/queries/getOrCreateWebsiteSettings";
import JoinClientWrapper from "./_components/JoinClientWrapper";

import { draftMode } from "next/headers";

export const revalidate = 300;

export default async function JoinPage() {
  
  const draft = await draftMode();
  const isPreview = draft.isEnabled;

  const club = await getCurrentClub();
  if (!club) notFound();

  const settings = await getOrCreateWebsiteSettings(club.id);

  return (
    <JoinClientWrapper
      clubId={club.id}
      clubName={club.name}
      initialSettings={{
        joinTitle: settings.joinTitle,
        joinSubtitle: settings.joinSubtitle,
        joinSuccessTitle: settings.joinSuccessTitle,
        joinSuccessDesc: settings.joinSuccessDesc,
      }}
      isPreview={isPreview}
    />
  );
}
