import { PingRpcs } from "./ping";
import { WorkspaceRpcs } from "./workspace";
import { WorkspaceInvitationRpcs } from "./workspace-invitation";

export * from "./ping";
export * from "./project";
export * from "./task";
export * from "./workspace";
export * from "./workspace-invitation";

const PublicRpc = PingRpcs;
const PrivateRpc = WorkspaceRpcs.merge(WorkspaceInvitationRpcs);

export const MasonRpc = PublicRpc.merge(PrivateRpc);
