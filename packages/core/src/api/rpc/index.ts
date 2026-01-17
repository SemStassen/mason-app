import { PingRpc } from "./ping";
import { WorkspaceRpcs } from "./workspace";
import { WorkspaceInvitationRpcs } from "./workspace-invitation";

export * from "./ping";
export * from "./workspace";
export * from "./workspace-invitation";

const PublicRpc = PingRpc;
const PrivateRpc = WorkspaceRpcs.merge(WorkspaceInvitationRpcs);

export const MasonRpc = PublicRpc.merge(PrivateRpc);
