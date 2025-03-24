import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@mason/ui/breadcrumb";
import { Icons } from "@mason/ui/icons";
import { createFileRoute } from "@tanstack/react-router";
import { RouteHeader } from "../route-header";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="flex w-full flex-col">
      <RouteHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>
                <Icons.Home />
                Dashboard
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </RouteHeader>
    </div>
  );
}
