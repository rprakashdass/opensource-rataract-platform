export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
    COMMUNITY_SERVICE: "https://images.unsplash.com/photo-1593113580332-ceb4c5fb4326?auto=format&fit=crop&q=80&w=800",
    PROFESSIONAL_DEVELOPMENT: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800",
    CLUB_SERVICE: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800",
    INTERNATIONAL_SERVICE: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=800",
    FUNDRAISER: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=800",
    OTHER: "https://images.unsplash.com/photo-1506869640319-fea1a28867a6?auto=format&fit=crop&q=80&w=800",
    DEFAULT: "https://images.unsplash.com/photo-1506869640319-fea1a28867a6?auto=format&fit=crop&q=80&w=800"
};

export function getFallbackImage(category?: string | null): string {
    if (!category) return CATEGORY_FALLBACK_IMAGES.DEFAULT;
    return CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.DEFAULT;
}
