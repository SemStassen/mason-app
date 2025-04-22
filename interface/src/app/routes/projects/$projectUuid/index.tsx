import { zodResolver } from "@hookform/resolvers/zod";
import type { Activity, InsertActivity, Project, User } from "@mason/db/schema";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@mason/ui/breadcrumb";
import { Button } from "@mason/ui/button";
import {} from "@mason/ui/collapsible";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTrigger,
} from "@mason/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@mason/ui/dropdown";
import { Form, FormControl, FormField, FormItem } from "@mason/ui/form";
import { Icons } from "@mason/ui/icons";
import { Input } from "@mason/ui/input";
import { toast } from "@mason/ui/sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@mason/ui/tooltip";
import { cn } from "@mason/ui/utils";
import {
  Link,
  createFileRoute,
  stripSearchParams,
} from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { observer } from "mobx-react-lite";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { List, ListContent, ListHeader, ListItem } from "~/components/list";
import { RouteHeader } from "~/components/route-header";
import { useLiveQuery } from "~/hooks/use-live-query";
import { getPGliteConnection } from "~/lib/db";
import { copyCurrentUrlToClipboard } from "~/lib/utils/copy-current-url";
import { displayName } from "~/lib/utils/display-name";
import { rootStore } from "~/stores/root-store";
import { ProjectSidebar } from "./project-sidebar";

const activitiesSearchDefault = {
  search: "",
};

const activitiesSearchSchema = z.object({
  search: z.string().default(activitiesSearchDefault.search),
});

export const Route = createFileRoute("/projects/$projectUuid")({
  validateSearch: zodValidator(activitiesSearchSchema),
  search: {
    middlewares: [stripSearchParams(activitiesSearchDefault)],
  },
  loaderDeps: ({ search: { search } }) => ({
    search,
  }),
  loader: async ({ abortController, params, deps }) => {
    const pg = await getPGliteConnection();

    const liveUsers = pg.live.query<User>({
      query: `
        SELECT * FROM users WHERE workspace_uuid = $1
      `,
      params: [rootStore.appStore.workspaceUuid],
      signal: abortController.signal,
      offset: 0,
      limit: 100,
    });

    const liveProjects = pg.live.query<Project>({
      query: `
        SELECT * FROM projects WHERE uuid = $1
      `,
      params: [params.projectUuid],
      signal: abortController.signal,
      offset: 0,
      limit: 100,
    });

    const liveActivities = pg.live.query<Activity>({
      query: `
        SELECT * from activities
        WHERE project_uuid = $1 AND name ILIKE $2
      `,
      params: [params.projectUuid, `%${deps.search}%`],
      signal: abortController.signal,
      offset: 0,
      limit: 100,
    });

    return { pg, liveUsers, liveProjects, liveActivities };
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
          <Icons.Sidebar className="rotate-180" />
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

function ActivitiesSearch() {
  const { search } = Route.useSearch();
  const navigate = Route.useNavigate();

  const updateSearch = (newValue: string) => {
    navigate({
      search: (prev) => ({ ...prev, search: newValue }),
    });
  };

  return (
    <Input
      className="w-60"
      variant="outline"
      iconLeft={<Icons.Search />}
      iconRight={
        search && (
          <Icons.X
            className="cursor-pointer"
            onClick={() => updateSearch("")}
          />
        )
      }
      placeholder="Search by name..."
      value={search}
      onChange={(e) => updateSearch(e.target.value)}
    />
  );
}

const createActivitySchema = z.object({
  name: z.string().min(1),
  project_uuid: z.string(),
}) satisfies z.ZodType<InsertActivity>;

function CreateActivity() {
  const { projectUuid } = Route.useParams();
  const { pg } = Route.useLoaderData();

  const form = useForm<z.infer<typeof createActivitySchema>>({
    resolver: zodResolver(createActivitySchema),
    defaultValues: {
      name: "",
      project_uuid: projectUuid,
    },
  });

  const onSubmit = async (values: z.infer<typeof createActivitySchema>) => {
    // MUTATION
    try {
      await pg.query(
        `
          INSERT INTO activities (name, project_uuid) VALUES ($1, $2)
        `,
        [values.name, values.project_uuid],
      );
      form.reset();
    } catch (e) {
      toast.error("Something went wrong creating a new activity");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Icons.Plus />
              </Button>
            </TooltipTrigger>
            <TooltipContent align="end">Create new activity</TooltipContent>
          </Tooltip>
        </span>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader />
            <DialogMain>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        autoFocus={true}
                        placeholder="Add activity name..."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </DialogMain>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  type="submit"
                  variant="default"
                  disabled={form.formState.isSubmitting}
                >
                  Create activity
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ProjectPage() {
  const { pg, liveProjects, liveActivities } = Route.useLoaderData();

  const projectsData = useLiveQuery(liveProjects);
  const activitiesData = useLiveQuery(liveActivities);

  const project = projectsData?.rows[0];
  const activities = activitiesData?.rows;

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
        <div className="flex gap-2">
          <OpenInfoPanel />
          <OptionsMenu />
        </div>
      </RouteHeader>
      <div className="flex h-full grow">
        <div className="flex w-full flex-col">
          <div className="px-4 py-8">
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
            <ActivitiesSearch />
          </div>
          <List>
            <ListHeader>
              Activities
              <CreateActivity />
            </ListHeader>
            <ListContent>
              {activities?.map((activity) => (
                <ListItem key={activity.uuid}>{activity.name}</ListItem>
              ))}
            </ListContent>
          </List>
        </div>
        <ProjectSidebar />
      </div>
    </div>
  );
}
