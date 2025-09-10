import { clientEnv } from "@mason/env/client";
import { hc } from "hono/client";
import type { AppType } from "../../../apps/server/src/index";

export const honoClient = hc<AppType>(clientEnv.VITE_MASON_API_URL);
