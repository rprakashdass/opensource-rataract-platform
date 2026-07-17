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

  // Revalidate common tags
  // @ts-ignore
  revalidateTag("club", "max");
  // @ts-ignore
  revalidateTag("homepage", "max");
  // @ts-ignore
  revalidateTag("layout", "max");
  // @ts-ignore
  revalidateTag("website-settings", "max");
}
