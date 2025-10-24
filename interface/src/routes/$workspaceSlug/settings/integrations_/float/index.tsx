import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { Button, type ButtonProps } from "@mason/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@mason/ui/card";
import { Separator } from "@mason/ui/separator";
import { createFileRoute } from "@tanstack/react-router";
import { useTransition } from "react";
import {
  deleteWorkspaceIntegrationAtom,
  workspaceIntegrationsAtom,
} from "~/atoms/api";
import { MasonAtomClient } from "~/client";
import { formatter } from "~/utils/date-time";
import { CreateWorkspaceIntegrationForm } from "../-components/create-workspace-integration-form";

export const Route = createFileRoute(
  "/$workspaceSlug/settings/integrations_/float/",
)({
  beforeLoad: () => ({
    getTitle: () => "Float",
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const workspaceIntegrations = useAtomValue(workspaceIntegrationsAtom);
  const integration = workspaceIntegrations.find((i) => i.kind === "float");

  const [isPending, startTransition] = useTransition();
  const syncProjects = useAtomSet(
    MasonAtomClient.mutation("FloatWorkspaceIntegration", "Sync"),
    {
      mode: "promise",
    },
  );

  const handleSyncProjects = () => {
    startTransition(async () => {
      await syncProjects({
        reactivityKeys: ["workspaceIntegrations"],
      });
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          {integration ? (
            <div className="flex items-center justify-between">
              <CardTitle>
                Connected on {formatter.date(integration.createdAt)}
              </CardTitle>
              <DisconnectWorkspaceIntegrationButton
                integrationId={integration?.id}
              />
            </div>
          ) : (
            <CardTitle>Connect</CardTitle>
          )}
        </CardHeader>
        {!integration && (
          <CardContent>
            <CreateWorkspaceIntegrationForm kind="float" />
          </CardContent>
        )}
      </Card>
      {integration && (
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div>Sycn all</div>
                {integration._metadata?.lastSyncedAt && (
                  <div className="text-muted-foreground text-sm">
                    Last synced on{" "}
                    {formatter.dateTime(integration._metadata.lastSyncedAt)}
                  </div>
                )}
              </div>
              <Button disabled={isPending} onClick={handleSyncProjects}>
                Sync from Float
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function DisconnectWorkspaceIntegrationButton({
  integrationId,
  ...props
}: ButtonProps & {
  integrationId: string;
}) {
  const deleteWorkspaceIntegration = useAtomSet(
    deleteWorkspaceIntegrationAtom(integrationId),
  );

  return (
    <Button
      onClick={() => deleteWorkspaceIntegration()}
      variant="destructive"
      {...props}
    >
      Disconnect
    </Button>
  );
}
