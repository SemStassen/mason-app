import { Model, Schema } from "~/shared/effect";
import { Email, UserId } from "~/shared/schemas";

export class User extends Model.Class<User>("User")(
	{
		id: Model.ServerManaged(UserId),
		displayName: Model.Mutable(
			Schema.NonEmptyTrimmedString.check(Schema.isMaxLength(100)),
		),
		email: Model.ServerImmutable(Email),
		emailVerified: Model.ServerManaged(Schema.Boolean),
		imageUrl: Model.MutableOptional(
			Schema.Option(Schema.NonEmptyTrimmedString),
		),
	},
	{
		identifier: "User",
		title: "User",
		description: "A user",
	},
) {}
