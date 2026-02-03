import { AuthorizationService } from "@mason/authorization";
import { Effect, Redacted, Schema } from "effect";
import { CryptoService } from "~/infra/crypto";
import { WorkspaceIntegration } from "~/modules/integration/domain/workspace-integration.model";
import { IntegrationModuleService } from "~/modules/integration/integration-module.service";
import { WorkspaceContext } from "~/shared/auth";
import { EncryptedApiKey } from "~/shared/schemas";

export const CreateWorkspaceIntegrationRequest =
  WorkspaceIntegration.flowCreate;

export const CreateWorkspaceIntegrationFlow = Effect.fn(
  "CreateWorkspaceIntegrationFlow"
)(function* (request: typeof CreateWorkspaceIntegrationRequest.Type) {
  const { member, workspace } = yield* WorkspaceContext;

  const authz = yield* AuthorizationService;
  const crypto = yield* CryptoService;

  const integrationModule = yield* IntegrationModuleService;

  yield* authz.ensureAllowed({
    action: "workspace:create_integration",
    role: member.role,
  });

  const encryptedApiKey = yield* crypto
    .encrypt(Redacted.value(request.apiKey))
    .pipe(
      Effect.flatMap((encrypted) =>
        Schema.decodeUnknown(EncryptedApiKey)(encrypted)
      )
    );

  yield* integrationModule.createWorkspaceIntegration({
    ...request,
    apiKey: encryptedApiKey,
    createdByMemberId: member.id,
    workspaceId: workspace.id,
  });
});
