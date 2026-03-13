import { Effect, Layer, Option } from "effect";
import { UserId } from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";
import { Session } from "./domain/session.entity";
import { User } from "./domain/user.entity";
import {
	IdentityModule,
	SessionNotFoundError,
	UserNotFoundError,
} from "./identity.service";
import { SessionRepository } from "./session.repository";
import { UserRepository } from "./user.repository";

export const IdentityModuleLayer = Layer.effect(
	IdentityModule,
	Effect.gen(function* () {
		const SessionRepo = yield* SessionRepository;
		const UserRepo = yield* UserRepository;

		return {
			setActiveWorkspace: Effect.fn("identity/setActiveWorkspace")(
				function* (params) {
					const session = yield* SessionRepo.findById(params.sessionId).pipe(
						Effect.flatMap(
							Option.match({
								onNone: () =>
									Effect.fail(
										new SessionNotFoundError({ sessionId: params.sessionId }),
									),
								onSome: Effect.succeed,
							}),
						),
					);

					const updatedSession = Session.make({
						...session,
						activeWorkspaceId: params.workspaceId,
					});

					const persistedSession = yield* SessionRepo.update(updatedSession);

					return persistedSession;
				},
			),
			createUser: Effect.fn("identity/createUser")(function* (params) {
				const user = User.make({
					...params,
					id: UserId.makeUnsafe(generateUUID()),
					emailVerified: false,
					imageUrl: params.imageUrl ?? Option.none(),
				});

				const [persistedUser] = yield* UserRepo.insert([user]);

				return persistedUser;
			}),
			updateUser: Effect.fn("identity/updateUser")(function* (params) {
				const user = yield* UserRepo.findById(params.userId).pipe(
					Effect.flatMap(
						Option.match({
							onNone: () =>
								Effect.fail(new UserNotFoundError({ userId: params.userId })),
							onSome: Effect.succeed,
						}),
					),
				);

				const updatedUser = User.make({
					...user,
					...params.data,
				});

				const persistedUser = yield* UserRepo.update(updatedUser);

				return persistedUser;
			}),
			retrieveUserByEmail: Effect.fn("identity/retrieveUserByEmail")(
				function* (email) {
					return yield* UserRepo.findByEmail(email);
				},
			),
		};
	}),
);
