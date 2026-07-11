import { getCurrentClub } from "@/lib/club";
import { notFound } from "next/navigation";
import { getOrCreateWebsiteSettings } from "@/features/public/queries/getOrCreateWebsiteSettings";
import JoinClientWrapper from "./_components/JoinClientWrapper";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const resolvedParams = await searchParams;
  const isPreview = resolvedParams?.preview === "true";

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
