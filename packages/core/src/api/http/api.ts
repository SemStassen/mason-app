import { HttpApi } from "effect/unstable/httpapi";

import { PingHttpGroup } from "./ping";

export class MasonApi extends HttpApi.make("MasonApi").add(PingHttpGroup) {}
