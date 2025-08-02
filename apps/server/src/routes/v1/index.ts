import type { auth } from "@mason/auth/server";
import { Hono } from "hono";
import type { RequestIdVariables } from "hono/request-id";
import { authMiddleware } from "~/lib/middlewares/auth";
import { projectsRoute } from "./projects";

export type Variables = RequestIdVariables & {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

export const v1Route = new Hono<{
  Variables: Variables;
}>()
  /**
   * Middleware
   */
  .use("*", authMiddleware)
  /**
   * Routes
   */
  .route("/projects", projectsRoute);
