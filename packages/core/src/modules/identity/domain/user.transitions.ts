import { Result } from "effect";

import { User } from "./user.entity";

export const updateUser = (params: {
  user: User;
  data: typeof User.jsonUpdate.Type;
}): Result.Result<{ entity: User; changes: typeof User.update.Type }, never> =>
  Result.succeed({
    entity: User.makeUnsafe({ ...params.user, ...params.data }),
    changes: params.data,
  });
