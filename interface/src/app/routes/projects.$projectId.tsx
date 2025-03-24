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
import { Tooltip, TooltipContent, TooltipTrigger } from "@mason/ui/tooltip";
import { cn } from "@mason/ui/utils";
import { Link, createFileRoute } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { AnimatePresence, motion } from "motion/react";
import { useLiveQuery } from "~/hooks/use-live-query";
import { getPGliteConnection } from "~/lib/db";
import { copyCurrentUrlToClipboard } from "~/lib/utils/copy-current-url";
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

    return { liveProjects };
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
  const { liveProjects } = Route.useLoaderData();

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
              <BreadcrumbPage>{project.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <OpenInfoPanel />
          <OptionsMenu />
        </div>
      </RouteHeader>
      <div className="flex grow">
        <div className="w-full px-8 py-4">
          <h2 className="text-2xl">{project.name}</h2>
          <div>
            <h3>Project details</h3>
            <p>Project details go here</p>
          </div>
        </div>
        <ProjectInfoPanel />
      </div>
    </div>
  );
}
