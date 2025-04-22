import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import { authRoute } from "./routes/auth";

const app = new Hono().basePath("/api");

/**
 * Middleware
 */
app.use("*", requestId());
app.use("*", logger());
app.use("*", prettyJSON());

/**
 * TODO: ADD ERROR HANDLER
 */

/**
 * Ping
 */
app.get("/ping", (c) => {
  return c.json({ message: "pong", requestId: c.get("requestId") }, 200);
});

app.route("/auth", authRoute);

console.log("Starting server on port 8001");

const server = { port: 8001, fetch: app.fetch };

export default server;
