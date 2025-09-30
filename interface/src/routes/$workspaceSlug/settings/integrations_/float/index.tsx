import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { Button, type ButtonProps } from "@mason/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@mason/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import {
  deleteWorkspaceIntegrationAtom,
  workspaceIntegrationsAtom,
} from "~/atoms/api";
import { UpsertWorkspaceIntegrationForm } from "../-components/upsert-workspace-integration-form";

export const Route = createFileRoute(
  "/$workspaceSlug/settings/integrations_/float/"
)({
  beforeLoad: () => {
    return {
      getTitle: () => "Float",
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const workspaceIntegrations = useAtomValue(workspaceIntegrationsAtom);

  const integration = workspaceIntegrations.find((i) => i.kind === "float");

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Connect</CardTitle>
        {integration && (
          <DeleteWorkspaceIntegrationButton integrationId={integration?.id} />
        )}
      </CardHeader>
      <CardContent>
        {integration ? (
          <div>Connected</div>
        ) : (
          <UpsertWorkspaceIntegrationForm kind="float" />
        )}
      </CardContent>
    </Card>
  );
}

function DeleteWorkspaceIntegrationButton({
  integrationId,
  ...props
}: ButtonProps & {
  integrationId: string;
}) {
  const deleteWorkspaceIntegration = useAtomSet(
    deleteWorkspaceIntegrationAtom(integrationId)
  );

  return (
    <Button
      onClick={() => deleteWorkspaceIntegration()}
      variant="destructive"
      {...props}
    >
      Delete
    </Button>
  );
}
