import { useAtomValue } from "@effect-atom/atom-react";
import { Avatar, AvatarFallback } from "@mason/ui/avatar";
import { Badge } from "@mason/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@mason/ui/card";
import { Icons } from "@mason/ui/icons";
import { createFileRoute, Link } from "@tanstack/react-router";
import { workspaceIntegrationsAtom } from "~/atoms/api";

export const Route = createFileRoute("/$workspaceSlug/settings/integrations/")({
  beforeLoad: () => ({
    getTitle: () => "Integrations",
  }),
  component: RouteComponent,
});

const defaultDescription =
  "Connect your external time tracking tool to sync time entries, projects, and team data automatically.";

function RouteComponent() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <IntegrationCard
        description={defaultDescription}
        icon={<Icons.Company.Float />}
        kind="float"
      />
      <IntegrationCard
        description={defaultDescription}
        disabled={true}
        icon={<Icons.Company.Early />}
        kind="early"
      />
      <IntegrationCard
        description={defaultDescription}
        disabled={true}
        icon={<Icons.Company.Simplicate />}
        kind="simplicate"
      />
      <IntegrationCard
        description={defaultDescription}
        disabled={true}
        icon={<Icons.Company.Toggl />}
        kind="toggl"
      />
    </div>
  );
}

function IntegrationCard({
  kind,
  description,
  icon,
  disabled = false,
}: {
  kind: "float" | "early" | "simplicate" | "toggl";
  description: string;
  icon: React.ReactNode;
  disabled?: boolean;
}) {
  const workspaceIntegrations = useAtomValue(workspaceIntegrationsAtom);
  const integration = workspaceIntegrations.find((i) => i.kind === kind);

  return (
    <Link
      disabled={disabled}
      from="/$workspaceSlug/settings/integrations"
      to={`/$workspaceSlug/settings/integrations/${kind as "float"}`}
    >
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar rounded="lg">
              <AvatarFallback>{icon}</AvatarFallback>
            </Avatar>
            <CardTitle>{kind}</CardTitle>
          </div>
          {disabled && <Badge variant="info">Coming soon</Badge>}
          {integration && <Badge variant="success">Connected</Badge>}
        </CardHeader>
        <CardContent>{description}</CardContent>
      </Card>
    </Link>
  );
}
