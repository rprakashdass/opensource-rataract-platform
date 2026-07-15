export interface HomepageSectionConfig {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
}

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Banner",
  president: "President's Message",
  impact: "Impact Metrics",
  gallery: "Photo Gallery",
  projects: "Featured Projects",
  events_news: "Events & Notice Board",
  sponsor: "Sponsor Callout",
};

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionConfig[] = [
  { id: "hero", label: SECTION_LABELS.hero, enabled: true, order: 0 },
  { id: "president", label: SECTION_LABELS.president, enabled: true, order: 1 },
  { id: "impact", label: SECTION_LABELS.impact, enabled: true, order: 2 },
  { id: "projects", label: SECTION_LABELS.projects, enabled: true, order: 3 },
  { id: "gallery", label: SECTION_LABELS.gallery, enabled: true, order: 4 },
  { id: "events_news", label: SECTION_LABELS.events_news, enabled: true, order: 5 },
  { id: "sponsor", label: SECTION_LABELS.sponsor, enabled: true, order: 6 },
];

/**
 * `WebsiteSettings.homepageSections` is the single source of truth for which
 * homepage sections are shown and in what order. This normalizes whatever is
 * stored (possibly empty/stale) into a complete, ordered config.
 */
export function normalizeHomepageSections(raw: unknown): HomepageSectionConfig[] {
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((s: any, idx: number) => ({
      id: s.id,
      label: SECTION_LABELS[s.id] || s.id,
      enabled: s.enabled !== false,
      order: s.order ?? idx,
    }));
  }
  return DEFAULT_HOMEPAGE_SECTIONS.map(s => ({ ...s }));
}

export function isSectionEnabled(sections: HomepageSectionConfig[], id: string): boolean {
  return sections.find(s => s.id === id)?.enabled !== false;
}
