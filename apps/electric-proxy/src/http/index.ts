import {
  HttpApi,
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiGroup,
} from "@effect/platform";
import { Effect } from "effect";

const ElectricProxyApi = HttpApi.make("ElectricProxyApi").add(
  HttpApiGroup.make("Requests").add(HttpApiEndpoint.get("User")`/v1/shape`)
);

const RequestsLive = HttpApiBuilder.group(
  ElectricProxyApi,
  "Requests",
  (handlers) =>
    handlers.handle(
      "User",
      Effect.fn("ElectricProxy/User")(function* ({ request }) {})
    )
);
