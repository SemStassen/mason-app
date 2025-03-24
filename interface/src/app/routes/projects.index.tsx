import type { User, Workspace } from "@mason/db/schema";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@mason/ui/breadcrumb";
import { Button } from "@mason/ui/button";
import { Icons } from "@mason/ui/icons";
import { Input } from "@mason/ui/input";
import { Label } from "@mason/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@mason/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@mason/ui/select";
import { Toggle } from "@mason/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@mason/ui/tooltip";
import {
  Link,
  createFileRoute,
  stripSearchParams,
} from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useLiveQuery } from "~/hooks/use-live-query";
import { getPGliteConnection } from "~/lib/db";
import { rootStore } from "~/stores/root-store";
import { RouteHeader } from "../route-header";

const projectsSearchDefault = {
  sortBy: "name",
  sortOrder: "ASC",
  search: "",
} as const;

const sortBySchema = z
  .enum(["name", "created_at"])
  .default(projectsSearchDefault.sortBy)
  .catch(projectsSearchDefault.sortBy);

const sortOrderSchema = z
  .enum(["ASC", "DESC"])
  .default(projectsSearchDefault.sortOrder)
  .catch(projectsSearchDefault.sortOrder);

const projectsSearchSchema = z.object({
  sortBy: sortBySchema,
  sortOrder: sortOrderSchema,
  search: z.string().default(projectsSearchDefault.search),
});

export const Route = createFileRoute("/projects/")({
  validateSearch: zodValidator(projectsSearchSchema),
  search: {
    middlewares: [stripSearchParams(projectsSearchDefault)],
  },
  loaderDeps: ({ search: { sortBy, sortOrder, search } }) => ({
    sortBy,
    sortOrder,
    search,
  }),
  loader: async ({ abortController, deps }) => {
    const pg = await getPGliteConnection();
    const liveWorkspaces = pg.live.query<Workspace>({
      query: "SELECT * FROM workspaces WHERE uuid = $1",
      params: [rootStore.appStore.workspaceUuid],
      signal: abortController.signal,
      offset: 0,
      limit: 100,
    });

    const liveProjects = pg.live.query<User>({
      query: `SELECT * FROM projects WHERE workspace_uuid = $1 AND name ILIKE $2 ORDER BY ${deps.sortBy} ${deps.sortOrder}`,
      params: [rootStore.appStore.workspaceUuid, `%${deps.search}%`],
      signal: abortController.signal,
      offset: 0,
      limit: 100,
    });

    return { liveWorkspaces, liveProjects };
  },
  component: Projects,
});

function DisplayOptions() {
  const { sortBy, sortOrder } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">
                <Icons.Slider />
                Display
              </Button>
            </TooltipTrigger>
            <TooltipContent align="end">Show display settings</TooltipContent>
          </Tooltip>
          <PopoverContent align="end">
            <div className="flex items-center justify-between">
              <Label>Order by</Label>
              <div className="flex gap-2">
                <Select
                  value={sortBy}
                  onValueChange={(val: z.infer<typeof sortBySchema>) =>
                    navigate({
                      search: (prev) => ({
                        ...prev,
                        sortBy: val,
                      }),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="created_at">Created</SelectItem>
                  </SelectContent>
                </Select>
                <Toggle
                  variant="outline"
                  pressed={sortOrder === "ASC"}
                  onPressedChange={(val) =>
                    navigate({
                      search: (prev) => ({
                        ...prev,
                        sortOrder: val ? "ASC" : "DESC",
                      }),
                    })
                  }
                >
                  {sortOrder === "ASC" ? (
                    <Icons.SortAscending />
                  ) : (
                    <Icons.SortDescending />
                  )}
                </Toggle>
              </div>
            </div>
          </PopoverContent>
        </span>
      </PopoverTrigger>
    </Popover>
  );
}

function ProjectsSearch() {
  const { search } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <Input
      className="w-40"
      IconLeft={<Icons.Search />}
      placeholder="Search by name..."
      value={search}
      onChange={(e) => {
        navigate({
          search: (prev) => ({
            ...prev,
            search: e.target.value,
          }),
        });
      }}
    />
  );
}

function Projects() {
  const { liveWorkspaces, liveProjects } = Route.useLoaderData();

  const workspacesData = useLiveQuery(liveWorkspaces);
  const projectsData = useLiveQuery(liveProjects);

  const workspace = workspacesData?.rows[0];
  const projects = projectsData?.rows;

  if (!workspace) {
    return null;
  }

  return (
    <div className="flex h-full w-full flex-col">
      <RouteHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>
                <Icons.Target />
                Projects
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <DisplayOptions />
        {/* <Button variant="outline" size="sm">
          <Icons.Plus />
          New
        </Button> */}
      </RouteHeader>
      <div className="flex items-center border-b p-4">
        <ProjectsSearch />
      </div>
      <div className="grow overflow-auto pb-16">
        <div className="flex h-9 items-center border-contrast-10 border-b bg-accent pr-4 pl-9.5 text-contrast-75">
          {workspace.name}
        </div>
        {projects?.map((project) => {
          return (
            <Link
              key={project.uuid}
              type="button"
              className="flex h-18 w-full items-center gap-2 border-contrast-5 not-last:border-b px-4 text-sm hover:bg-contrast-5"
              to="/projects/$projectId"
              params={{ projectId: project.uuid }}
            >
              <Icons.Folder />
              {project.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
