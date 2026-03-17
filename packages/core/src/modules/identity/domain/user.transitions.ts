import { Option, Result } from "effect";
import { UserId } from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";
import { User } from "./user.entity";

export const createUser = (
  data: typeof User.jsonCreate.Type
): Result.Result<User, never> =>
  Result.succeed(
    User.make({
      id: UserId.makeUnsafe(generateUUID()),
      imageUrl: data.imageUrl ?? Option.none(),
      emailVerified: false,
      ...data,
    })
  );

export const updateUser = (params: {
  user: User;
  data: typeof User.jsonUpdate.Type;
}): Result.Result<{ entity: User; changes: typeof User.update.Type }, never> =>
  Result.succeed({
    entity: User.make({ ...params.user, ...params.data }),
    changes: params.data,
  });
