"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export async function dismissGetStarted() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  await prisma.setting.upsert({
    where: { key: "setup_dismissed" },
    update: { value: "true" },
    create: {
      key: "setup_dismissed",
      value: "true",
      type: "boolean",
      description: "Whether the admin has dismissed the get-started onboarding page",
    },
  });

  redirect("/admin");
}
