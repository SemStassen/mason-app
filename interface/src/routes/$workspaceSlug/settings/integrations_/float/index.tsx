import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { Button } from "@mason/ui/button";
import { Frame, FrameHeader, FramePanel, FrameTitle } from "@mason/ui/frame";
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
  "/$workspaceSlug/settings/integrations_/float/"
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
    }
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
      <Frame>
        <FrameHeader>
          {integration ? (
            <div className="flex items-center justify-between">
              <FrameTitle>
                Connected on {formatter.date(integration.createdAt)}
              </FrameTitle>
              <DisconnectWorkspaceIntegrationButton
                integrationId={integration?.id}
              />
            </div>
          ) : (
            <FrameTitle>Connect</FrameTitle>
          )}
        </FrameHeader>
        {!integration && (
          <FramePanel>
            <CreateWorkspaceIntegrationForm kind="float" />
          </FramePanel>
        )}
      </Frame>
      {integration && (
        <Frame>
          <FrameHeader>
            <FrameTitle>Settings</FrameTitle>
          </FrameHeader>
          <FramePanel>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div>Sync all</div>
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
          </FramePanel>
        </Frame>
      )}
    </>
  );
}

function DisconnectWorkspaceIntegrationButton({
  integrationId,
}: {
  integrationId: string;
}) {
  const deleteWorkspaceIntegration = useAtomSet(
    deleteWorkspaceIntegrationAtom(integrationId)
  );

  return (
    <Button onClick={() => deleteWorkspaceIntegration()} variant="destructive">
      Disconnect
    </Button>
  );
}
