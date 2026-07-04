import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
