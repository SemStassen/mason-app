import { Result } from "effect";

import { Session } from "./session.entity";

export const updateSession = (params: {
  session: Session;
  data: typeof Session.jsonUpdate.Type;
}): Result.Result<
  { entity: Session; changes: typeof Session.update.Type },
  never
> =>
  Result.succeed({
    entity: Session.makeUnsafe({ ...params.session, ...params.data }),
    changes: params.data,
  });

export const updateSessionLastActiveWorkspace = (params: {
  session: Session;
  lastActiveWorkspaceId: Session["lastActiveWorkspaceId"];
}): Result.Result<
  { entity: Session; changes: typeof Session.update.Type },
  never
> =>
  Result.succeed({
    entity: Session.makeUnsafe({
      ...params.session,
      lastActiveWorkspaceId: params.lastActiveWorkspaceId,
    }),
    changes: {
      lastActiveWorkspaceId: params.lastActiveWorkspaceId,
    },
  });
