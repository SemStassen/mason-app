import { serverEnv } from "@mason/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export const pool = new Pool({
  host: "localhost",
  port: 5442,
  user: "electric_user",
  password: serverEnv.DB_PASSWORD,
  database: "mason",
});

export const db = drizzle({ client: pool });
export { eq } from "drizzle-orm";
