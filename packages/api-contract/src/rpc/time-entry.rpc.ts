import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import { TimeEntryResponse } from "../dto/time-entry.dto";

export class TimeEntryRpc extends RpcGroup.make(
  Rpc.make("List", {
    success: Schema.Array(TimeEntryResponse),
  })
) {}
