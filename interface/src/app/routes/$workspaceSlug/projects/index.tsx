import { zodResolver } from "@hookform/resolvers/zod";
import type { InsertProject, Project, Workspace } from "@mason/db/schema";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@mason/ui/breadcrumb";
import { Button } from "@mason/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTrigger,
} from "@mason/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@mason/ui/form";
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
import { toast } from "@mason/ui/sonner";
import { Toggle } from "@mason/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@mason/ui/tooltip";
import {
  Link,
  createFileRoute,
  stripSearchParams,
} from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { List, ListContent, ListItem } from "~/components/list";
import { RouteHeader } from "~/components/route-header";
import { useLiveQuery } from "~/hooks/use-live-query";
import { getPGliteConnection } from "~/lib/db";
import { displayName } from "~/lib/utils/display-name";
import { rootStore } from "~/stores/root-store";

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

export const Route = createFileRoute("/$workspaceSlug/_app-layout/projects/")({
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
      query: `
        SELECT * FROM workspaces WHERE id = $1
      `,
      params: [rootStore.appStore.workspaceId],
      signal: abortController.signal,
      offset: 0,
      limit: 100,
    });

    const liveProjects = pg.live.query<Project>({
      query: `
        SELECT * FROM projects 
        WHERE workspace_id = $1 AND name ILIKE $2 
        ORDER BY ${deps.sortBy} ${deps.sortOrder}
      `,
      params: [rootStore.appStore.workspaceId, `%${deps.search}%`],
      signal: abortController.signal,
      offset: 0,
      limit: 100,
    });

    return { pg, liveWorkspaces, liveProjects };
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

const createProjectSchema = z.object({
  name: z.string().min(1),
  workspace_id: z.string(),
  hex_color: z.string(),
}) satisfies z.ZodType<InsertProject>;

function CreateProject() {
  const { pg } = Route.useLoaderData();

  const form = useForm<z.infer<typeof createProjectSchema>>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      workspace_id: rootStore.appStore.workspaceId,
    },
  });

  const onSubmit = async (values: z.infer<typeof createProjectSchema>) => {
    // MUTATION
    try {
      await pg.query(
        "INSERT INTO projects (name, workspace_uuid) VALUES ($1, $2)",
        [values.name, values.workspace_id],
      );
      form.reset();
    } catch (e) {
      toast.error("Something went wrong creating a new project");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">
                <Icons.Plus />
                Create project
              </Button>
            </TooltipTrigger>
            <TooltipContent align="end">Create new project</TooltipContent>
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
                        placeholder="Add project name..."
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
                  Create project
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ProjectsSearch() {
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
      size="sm"
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

function Projects() {
  const { liveWorkspaces, liveProjects } = Route.useLoaderData();

  const workspacesData = useLiveQuery(liveWorkspaces);
  const projectsData = useLiveQuery(liveProjects);

  const workspace = workspacesData?.rows[0];
  const projects = projectsData?.rows;

  // if (!workspace) {
  //   return null;
  // }

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
      </RouteHeader>
      <div className="flex items-center justify-between border-b p-4">
        <ProjectsSearch />
        <div className="flex gap-2">
          <DisplayOptions />
          <CreateProject />
        </div>
      </div>
      <List>
        {/* <ListHeader>{workspace.name}</ListHeader> */}
        <ListContent>
          {projects?.map((project) => {
            return (
              <ListItem key={project.id}>
                <Link
                  type="button"
                  className="inset-0.5 flex w-full items-center gap-2 border-contrast-5 not-last:border-b text-sm hover:bg-contrast-5 "
                  from="/$workspaceSlug/projects"
                  to="/$workspaceSlug/projects/$projectId"
                  params={{
                    projectId: project.id,
                  }}
                >
                  <Icons.Folder />
                  {displayName(project.name, "project")}
                </Link>
              </ListItem>
            );
          })}
        </ListContent>
      </List>
    </div>
  );
}
