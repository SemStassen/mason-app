import { auth } from "@mason/auth/server";
import { Hono } from "hono";
import { cors } from "hono/cors";

export const authRoute = new Hono();

authRoute.use("*", cors());

authRoute.on(["POST", "GET"], "*", (c) => auth.handler(c.req.raw));
