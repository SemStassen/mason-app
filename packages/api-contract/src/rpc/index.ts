import { AuthMiddleware } from "../middleware/auth";
import { SessionMiddleware } from "../middleware/session";
import { AuthRpc } from "./auth.rpc";
import { FloatWorkspaceIntegrationRpc } from "./float-workspace-integration.rpc";
import { OAuthRpc } from "./o-auth.rpc";
import { PingRpc } from "./ping.rpc";
import { ProjectRpc } from "./project.rpc";
import { TaskRpc } from "./task.rpc";
import { TimeEntryRpc } from "./time-entry.rpc";
import { WorkspaceRpc } from "./workspace.rpc";
import { WorkspaceIntegrationRpc } from "./workspace-integration.rpc";

// Note: RpcGroup.make() doesn't support nesting groups directly.
// However, you CAN use .merge() to combine groups after creation.
// This allows you to nest/organize groups logically.

// Public RPC (no auth required)
// Start with first group, then merge others
export const PublicMasonRpc = PingRpc.merge(AuthRpc, OAuthRpc);

// Private RPC (requires auth)
// Start with first group, then merge others
export const PrivateMasonRpc = WorkspaceRpc.merge(
  // Requires workspace context (session)
  ProjectRpc,
  TaskRpc,
  TimeEntryRpc,
  WorkspaceIntegrationRpc,
  FloatWorkspaceIntegrationRpc
)
  .middleware(SessionMiddleware)
  .middleware(AuthMiddleware);

// Combined RPC router
// Merge public and private groups
export const MasonRpc = PublicMasonRpc.merge(PrivateMasonRpc);
