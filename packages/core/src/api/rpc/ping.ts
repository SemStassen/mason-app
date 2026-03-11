import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

export const PingRpcs = RpcGroup.make(
	Rpc.make("Ping", {
		success: Schema.Struct({
			status: Schema.Literal("OK"),
			timestamp: Schema.DateTimeUtc,
		}),
	}),
);
