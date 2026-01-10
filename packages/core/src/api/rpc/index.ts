import { PingRpc } from "./ping";
import { WorkspaceRpc } from "./workspace";

const PublicRpc = PingRpc;

const privateRpc = WorkspaceRpc;

export const MasonRpc = PublicRpc.merge(privateRpc);
