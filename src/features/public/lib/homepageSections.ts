export interface HomepageSectionConfig {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
}

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Banner",
  belief: "Why We Exist",
  president: "A Letter to Our Community",
  thadam: "THADAM Theme Creed",
  impact: "Impact Metrics",
  gallery: "Photo Gallery",
  projects: "Featured Projects",
  events_news: "Events & Notice Board",
  sponsor: "Sponsor Callout",
};

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionConfig[] = [
  { id: "hero", label: SECTION_LABELS.hero, enabled: true, order: 0 },
  { id: "impact", label: SECTION_LABELS.impact, enabled: true, order: 1 },
  { id: "projects", label: SECTION_LABELS.projects, enabled: true, order: 2 },
  { id: "belief", label: SECTION_LABELS.belief, enabled: true, order: 3 },
  { id: "gallery", label: SECTION_LABELS.gallery, enabled: true, order: 4 },
  { id: "events_news", label: SECTION_LABELS.events_news, enabled: true, order: 5 },
  { id: "president", label: SECTION_LABELS.president, enabled: true, order: 6 },
  { id: "sponsor", label: SECTION_LABELS.sponsor, enabled: true, order: 7 },
  { id: "thadam", label: SECTION_LABELS.thadam, enabled: false, order: 8 },
];

/**
 * `WebsiteSettings.homepageSections` is the single source of truth for which
 * homepage sections are shown and in what order. This normalizes whatever is
 * stored (possibly empty/stale) into a complete, ordered config.
 *
 * Any section added to DEFAULT_HOMEPAGE_SECTIONS that a club hasn't stored yet
 * is auto-inserted right after its default predecessor — so new sections show
 * up for existing clubs without wiping their custom ordering/toggles.
 */
export function normalizeHomepageSections(raw: unknown): HomepageSectionConfig[] {
  if (Array.isArray(raw) && raw.length > 0) {
    const stored: HomepageSectionConfig[] = raw
      .map((s: any, idx: number) => ({
        id: s.id,
        label: SECTION_LABELS[s.id] || s.id,
        enabled: s.enabled !== false,
        order: s.order ?? idx,
      }))
      .sort((a, b) => a.order - b.order);

    const present = new Set(stored.map((s) => s.id));

    // Splice in any missing default section after its default predecessor.
    DEFAULT_HOMEPAGE_SECTIONS.forEach((def, i) => {
      if (present.has(def.id)) return;
      const prevDef = DEFAULT_HOMEPAGE_SECTIONS[i - 1];
      let insertAt = stored.length;
      if (prevDef) {
        const prevIdx = stored.findIndex((s) => s.id === prevDef.id);
        insertAt = prevIdx !== -1 ? prevIdx + 1 : stored.length;
      } else {
        insertAt = 0;
      }
      stored.splice(insertAt, 0, { ...def });
      present.add(def.id);
    });

    return stored.map((s, idx) => ({ ...s, order: idx }));
  }
  return DEFAULT_HOMEPAGE_SECTIONS.map((s) => ({ ...s }));
}

export function isSectionEnabled(sections: HomepageSectionConfig[], id: string): boolean {
  return sections.find(s => s.id === id)?.enabled !== false;
}
