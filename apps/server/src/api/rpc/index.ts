import { InvitesRpc } from "./invites";
import { PingRpc } from "./ping";

const PublicRpc = PingRpc;

const privateRpc = InvitesRpc;

export const MasonRpc = PublicRpc.merge(privateRpc);
