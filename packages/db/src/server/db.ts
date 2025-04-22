import { serverEnv } from "@mason/env/server";
import { Pool } from "pg";

export const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "electric_user",
  password: serverEnv.DB_PASSWORD,
  database: "mason",
});
