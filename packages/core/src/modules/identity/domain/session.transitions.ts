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
    entity: Session.make({ ...params.session, ...params.data }),
    changes: params.data,
  });
