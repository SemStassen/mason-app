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
        provider="float"
      />
      <IntegrationCard
        description={defaultDescription}
        disabled={true}
        icon={<Icons.Company.Early />}
        provider="early"
      />
      <IntegrationCard
        description={defaultDescription}
        disabled={true}
        icon={<Icons.Company.Simplicate />}
        provider="simplicate"
      />
      <IntegrationCard
        description={defaultDescription}
        disabled={true}
        icon={<Icons.Company.Toggl />}
        provider="toggl"
      />
    </div>
  );
}

function IntegrationCard({
  provider,
  description,
  icon,
  disabled = false,
}: {
  provider: "float" | "early" | "simplicate" | "toggl";
  description: string;
  icon: React.ReactNode;
  disabled?: boolean;
}) {
  const workspaceIntegrations = useAtomValue(workspaceIntegrationsAtom);
  const integration = workspaceIntegrations.find(
    (i) => i.provider === provider
  );

  return (
    <Link
      disabled={disabled}
      from="/$workspaceSlug/settings/integrations"
      to={`/$workspaceSlug/settings/integrations/${provider as "float"}`}
    >
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar rounded="lg">
              <AvatarFallback>{icon}</AvatarFallback>
            </Avatar>
            <CardTitle>{provider}</CardTitle>
          </div>
          {disabled && <Badge variant="info">Coming soon</Badge>}
          {integration && <Badge variant="success">Connected</Badge>}
        </CardHeader>
        <CardContent>{description}</CardContent>
      </Card>
    </Link>
  );
}
