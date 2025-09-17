import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform";

export const PingGroup =
  HttpApiGroup.make("Ping").add(HttpApiEndpoint.get("Ping")`/ping`);
