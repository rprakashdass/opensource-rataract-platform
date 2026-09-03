import { revalidatePath, revalidateTag } from "next/cache";

export function revalidatePublicRoutes() {
  const routes = [
    "/",
    "/about",
    "/team",
    "/partner",
    "/projects",
    "/events",
    "/gallery",
    "/join",
    "/our-archive",
    "/terms",
    "/privacy"
  ];
  
  routes.forEach(route => {
    revalidatePath(route);
  });

  // Every tag any unstable_cache'd public query is keyed under (see
  // src/features/public/queries/*.ts and src/lib/club.ts) — every one needs
  // busting here, or an edit to that content silently stays stale on the
  // public site for up to that query's revalidate window.
  const tags = [
    "club",
    "homepage",
    "layout",
    "website-settings",
    "settings",
    "team",
    "projects",
    "events",
    "gallery",
    "announcements",
    "milestones",
  ];

  tags.forEach(tag => {
    // @ts-ignore
    revalidateTag(tag, "max");
  });
}
