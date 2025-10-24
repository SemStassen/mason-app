import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  out: "migrations",
  dbCredentials: {
    // biome-ignore lint/style/noNonNullAssertion: Fine for config
    host: process.env.DB_HOST!,
    // biome-ignore lint/style/noNonNullAssertion: Fine for config
    port: Number.parseInt(process.env.DB_PORT!, 10),
    // biome-ignore lint/style/noNonNullAssertion: Fine for config
    user: process.env.DB_USER!,
    // biome-ignore lint/style/noNonNullAssertion: Fine for config
    password: process.env.DB_PASSWORD!,
    // biome-ignore lint/style/noNonNullAssertion: Fine for config
    database: process.env.DB_NAME!,
    ssl: false,
  },
});
