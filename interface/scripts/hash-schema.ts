import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const schemaPath = resolve(process.cwd(), "src/db/schema.sql");
const schemaHashPath = resolve(process.cwd(), "src/db/schema-hash.ts");

const schemaSql = await readFile(schemaPath, "utf8");
const schemaHash = createHash("sha256").update(schemaSql).digest("hex");

const fileContents = `export const SCHEMA_HASH = "${schemaHash}" as const;\n`;

await writeFile(schemaHashPath, fileContents, "utf8");
