"use client";

import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import JoinUsForm from "./JoinUsForm";
import { useCmsPreview } from "@/hooks/useCmsPreview";

interface JoinSettings {
  joinTitle?: string | null;
  joinSubtitle?: string | null;
  joinSuccessTitle?: string | null;
  joinSuccessDesc?: string | null;
}

export default function JoinClientWrapper({
  clubId,
  clubName,
  initialSettings,
  isPreview,
}: {
  clubId: string;
  clubName: string;
  initialSettings: JoinSettings;
  isPreview: boolean;
}) {
  const settings = useCmsPreview(initialSettings, { enabled: isPreview, channel: "join" });

  return (
    <div className="min-h-screen bg-slate-50 py-24">
      <MaxWidthWrapper>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              {settings.joinTitle || `Join ${clubName}`}
            </h1>
            <p className="text-lg text-slate-500 font-medium">
              {settings.joinSubtitle ||
                "We are a network of young leaders committed to making a difference in our community and the world. Fill out the form below and our board will get in touch with you!"}
            </p>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100">
            <JoinUsForm
              clubId={clubId}
              successTitle={settings.joinSuccessTitle || undefined}
              successDesc={settings.joinSuccessDesc || undefined}
            />
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
