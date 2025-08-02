import { Hono } from "hono";
import { showRoutes } from "hono/dev";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import { authRoute } from "./routes/auth";
import { v1Route } from "./routes/v1";

const app = new Hono()
  /**
   * Config
   */
  .basePath("/api")
  /**
   * Middleware
   */
  .use("*", requestId())
  .use("*", logger())
  .use("*", prettyJSON())
  /**
   * TODO: ADD ERROR HANDLER
   */

  /**
   * Ping
   */
  .get("/ping", (c) => {
    return c.json({ message: "pong", requestId: c.get("requestId") }, 200);
  })
  /*
   * Routes
   */
  .route("/auth", authRoute)
  .route("/v1", v1Route);

console.log("Starting server on port 8001");

showRoutes(app, {
  verbose: true,
});

const server = { port: 8001, fetch: app.fetch };

export default server;
export type AppType = typeof app;
