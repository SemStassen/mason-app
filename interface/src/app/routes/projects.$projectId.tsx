import type { Project } from "@mason/db/schema";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@mason/ui/breadcrumb";
import { Button } from "@mason/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@mason/ui/dropdown";
import { Icons } from "@mason/ui/icons";
import { Input } from "@mason/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@mason/ui/tooltip";
import { cn } from "@mason/ui/utils";
import { Link, createFileRoute } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { AnimatePresence, motion } from "motion/react";
import { useLiveQuery } from "~/hooks/use-live-query";
import { getPGliteConnection } from "~/lib/db";
import { copyCurrentUrlToClipboard } from "~/lib/utils/copy-current-url";
import { displayName } from "~/lib/utils/display-name";
import { rootStore } from "~/stores/root-store";
import { RouteHeader } from "../route-header";

export const Route = createFileRoute("/projects/$projectId")({
  loader: async ({ abortController, params }) => {
    const pg = await getPGliteConnection();

    const liveProjects = pg.live.query<Project>({
      query: "SELECT * FROM projects WHERE uuid = $1",
      params: [params.projectId],
      signal: abortController.signal,
      offset: 0,
      limit: 100,
    });

    return { pg, liveProjects };
  },
  component: ProjectPage,
});

function OptionsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost">
                <Icons.DotsThreeVertical />
              </Button>
            </TooltipTrigger>
            <TooltipContent align="end">Open options</TooltipContent>
          </Tooltip>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() =>
              copyCurrentUrlToClipboard({
                successMessage: "Project link copied to clipboard",
              })
            }
          >
            <Icons.Link />
            Copy project link
          </DropdownMenuItem>
          {/* Add delete here */}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const OpenInfoPanel = observer(() => {
  const { projectPageStore } = rootStore;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(projectPageStore.isInfoPanelOpen && "text-primary")}
          onClick={() => projectPageStore.toggleInfoPanel()}
        >
          <Icons.Edit />
        </Button>
      </TooltipTrigger>
      <TooltipContent align="end">
        {projectPageStore.isInfoPanelOpen
          ? "Close project info"
          : "Open project info"}
      </TooltipContent>
    </Tooltip>
  );
});

const ProjectInfoPanel = observer(() => {
  const { projectPageStore } = rootStore;

  return (
    <AnimatePresence initial={false}>
      {projectPageStore.isInfoPanelOpen && (
        <motion.div
          className="h-full flex-none overflow-hidden border-l"
          transition={{
            ease: "linear",
            duration: 0.1,
          }}
          initial={{ width: 0 }}
          animate={{ width: 292 }}
          exit={{ width: 0 }}
        >
          Info
        </motion.div>
      )}
    </AnimatePresence>
  );
});

function ProjectPage() {
  const { pg, liveProjects } = Route.useLoaderData();

  const projects = useLiveQuery(liveProjects);

  const project = projects?.rows[0];

  if (!project) {
    return null;
  }

  return (
    <div className="flex w-full flex-col">
      <RouteHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/projects">
                  <Icons.Target />
                  Projects
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {displayName(project.name, "project")}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex gap-1">
          <OpenInfoPanel />
          <OptionsMenu />
        </div>
      </RouteHeader>
      <div className="flex h-full grow">
        <div className="flex w-full flex-col">
          <div className="px-8 py-4">
            <Input
              size="lg"
              placeholder="Add project name..."
              defaultValue={project.name}
              onBlur={(e) => {
                // MUTATION
                pg.query("UPDATE projects SET name = $1 WHERE uuid = $2", [
                  e.target.value,
                  project.uuid,
                ]);
              }}
            />
            <div>
              <h3>Project details</h3>
              <p>Project details go here</p>
            </div>
          </div>
          <div className="flex items-center border-b p-4">
            <Input />
          </div>
          <div className="grow overflow-auto pb-16">
            <div className="flex h-9 items-center border-contrast-10 border-b bg-accent pr-4 pl-9.5 text-contrast-75">
              Activities
            </div>
            <div className="h-80">Activity</div>
            <div className="h-80">Activity</div>
            <div className="h-80">Activity</div>
            <div className="h-80">Activity</div>
          </div>
        </div>
        <ProjectInfoPanel />
      </div>
    </div>
  );
}
