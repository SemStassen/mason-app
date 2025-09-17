import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@mason/ui/accordion";
import { Avatar, AvatarFallback } from "@mason/ui/avatar";
import { Badge } from "@mason/ui/badge";
import { Card, CardContent } from "@mason/ui/card";
import { Icons } from "@mason/ui/icons";
import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { createMasonClient } from "~/client";
import { SetApiKeyForm } from "./-components/set-api-key-form";

export const Route = createFileRoute("/$workspaceSlug/settings/integrations/")({
  beforeLoad: () => {
    return {
      getTitle: () => "Integrations",
    };
  },
  loader: async ({ context }) => {
    const MasonClient = createMasonClient(context.platform);

    const workspaceIntegrations = await Effect.runPromise(
      MasonClient.WorkspaceIntegrations.ListIntegrations()
    );

    return { workspaceIntegrations };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { workspaceIntegrations } = Route.useLoaderData();
  return (
    <Card>
      <CardContent>
        <Accordion defaultValue={["float"]} openMultiple={false}>
          <AccordionItem value="float">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <Avatar rounded="lg">
                  <AvatarFallback>
                    <Icons.Company.Float />
                  </AvatarFallback>
                </Avatar>
                Float
                {workspaceIntegrations.some((i) => i.kind === "float") && (
                  <Badge variant="success">Activated</Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              Sync your current float project and time entries
              <SetApiKeyForm />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem disabled={true} value="early">
            <AccordionTrigger>
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar rounded="lg">
                    <AvatarFallback>
                      <Icons.Company.Early />
                    </AvatarFallback>
                  </Avatar>
                  Early
                </div>
                <Badge variant="info">Coming soon</Badge>
              </div>
            </AccordionTrigger>
          </AccordionItem>
          <AccordionItem disabled={true} value="simplicate">
            <AccordionTrigger>
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar rounded="lg">
                    <AvatarFallback>
                      <Icons.Company.Simplicate />
                    </AvatarFallback>
                  </Avatar>
                  Simplicate
                </div>
                <Badge variant="info">Coming soon</Badge>
              </div>
            </AccordionTrigger>
          </AccordionItem>
          <AccordionItem disabled={true} value="toggl">
            <AccordionTrigger>
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar rounded="lg">
                    <AvatarFallback>
                      <Icons.Company.Toggl />
                    </AvatarFallback>
                  </Avatar>
                  Toggl
                </div>
                <Badge variant="info">Coming soon</Badge>
              </div>
            </AccordionTrigger>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
