import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";

const app = new Hono();

/**
 * Middleware
 */
app.use("*", requestId());
app.use("*", logger());
app.use("*", prettyJSON());

/**
 * Ping
 */
app.get("/ping", (c) => {
  return c.json({ message: "pong", requestId: c.get("requestId") }, 200);
});
