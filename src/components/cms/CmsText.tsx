"use client";

import { useCmsPreview } from "@/hooks/useCmsPreview";

/**
 * Renders a single piece of CMS copy that live-updates from its editor's
 * CmsPreviewFrame when the page is loaded with ?preview=true. Use this for
 * standalone headings/labels on pages that are otherwise plain server
 * components, without converting the whole page into a client component.
 */
export function CmsText<T extends Record<string, any>>({
  channel,
  initial,
  field,
  fallback,
  isPreview,
}: {
  channel: string;
  initial: T;
  field: keyof T;
  fallback: string;
  isPreview: boolean;
}) {
  const data = useCmsPreview(initial, { enabled: isPreview, channel });
  return <>{(data?.[field] as string) || fallback}</>;
}
