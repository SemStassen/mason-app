import { HttpApi } from "effect/unstable/httpapi";

import { PingHttpGroup } from "./ping";

export class RecountApi extends HttpApi.make("RecountApi").add(PingHttpGroup) {}
