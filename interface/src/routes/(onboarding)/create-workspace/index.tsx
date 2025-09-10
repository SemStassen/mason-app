import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@mason/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@mason/ui/form";
import { Input } from "@mason/ui/input";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Effect } from "effect";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useMasonClient } from "~/client";
import { slugify } from "~/utils/slugify";

export const Route = createFileRoute("/(onboarding)/create-workspace/")({
  component: RouteComponent,
});

const createWorkspaceSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

type FormValues = z.infer<typeof createWorkspaceSchema>;

function RouteComponent() {
  const form = useForm<FormValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const name = form.watch("name");

  useEffect(() => {
    if (!form.getFieldState("slug").isDirty) {
      form.setValue("slug", slugify(name));
    }
  }, [form, name]);

  const navigate = useNavigate();
  const MasonClient = useMasonClient();

  const onSubmit = async (data: FormValues) => {
    await Effect.runPromise(
      MasonClient.Workspace.CreateWorkspace({
        payload: data,
      }).pipe(
        Effect.matchEffect({
          onFailure: () => Effect.fail(""),
          onSuccess: (workspace) =>
            Effect.sync(() => navigate({ to: `/${workspace.slug}` })),
        })
      )
    );
  };

  return (
    <div className="flex w-[320px] flex-col items-center gap-8">
      <h1 className="text-center font-medium text-2xl">Create workspace</h1>
      <Form {...form}>
        <form
          className="w-full space-y-8"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workspace name</FormLabel>
                <FormControl>
                  <Input autoComplete="off" autoFocus={true} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workspace URL</FormLabel>
                <FormControl>
                  <Input
                    affixGapPx={0}
                    autoComplete="off"
                    prefix="mason.app/"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" size="lg" type="submit">
            Create Workspace
          </Button>
        </form>
      </Form>
    </div>
  );
}
