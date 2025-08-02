import { zValidator } from "@hono/zod-validator";
import {
  type InsertProject,
  type Project,
  projectsTable,
} from "@mason/db/schema";
import { db, eq } from "@mason/db/server";
import { Hono } from "hono";
import { z } from "zod";
import type { Variables } from "..";

const createProjectSchema = z.object({
  workspace_id: z.string(),
  creator_id: z.string(),
  name: z.string(),
  hex_color: z.string(),
}) satisfies z.ZodSchema<InsertProject>;

const updateProjectSchema = z.object({
  lead_id: z.string().optional(),
  name: z.string().optional(),
  hex_color: z.string().optional(),
  is_billable: z.boolean().optional(),
  notes: z
    .object({
      nodes: z.any(),
    })
    .optional(),
}) satisfies z.ZodSchema<Partial<Project>>;

export const projectsRoute = new Hono<{ Variables: Variables }>()
  /**
   * Routes
   */
  .post("/", zValidator("form", createProjectSchema), async (c) => {
    const validated = c.req.valid("form");

    const [project] = await db
      .insert(projectsTable)
      .values(validated)
      .returning({ id: projectsTable.id });

    return c.json({
      id: project.id,
    });
  })
  .patch("/:id", zValidator("form", updateProjectSchema), async (c) => {
    const validated = c.req.valid("form");
    const { id } = c.req.param();

    await db
      .update(projectsTable)
      .set(validated)
      .where(eq(projectsTable.id, id));

    return c.json({
      id,
    });
  });
