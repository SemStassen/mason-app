import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@mason/auth/client";
import { Button } from "@mason/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@mason/ui/form2";
import { Input } from "@mason/ui/input";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { slugify } from "~/lib/utils/slugify";

export const Route = createFileRoute("/_onboarding-layout/create-workspace")({
  component: CreateWorkspacePage,
});

interface CreateWorkspaceForm extends z.infer<typeof createWorkspaceSchema> {}
const createWorkspaceSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

function CreateWorkspacePage() {
  const navigate = useNavigate();
  const form = useForm<CreateWorkspaceForm>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const onSubmit = async (values: CreateWorkspaceForm) => {
    const { data: organization, error } = await authClient.organization.create({
      name: values.name,
      slug: values.slug,
    });

    // TODO: Handle error case
    if (error) {
      return;
    }

    navigate({
      to: "/$workspaceSlug",
      params: {
        workspaceSlug: organization.slug,
      },
    });
  };

  // Automatically set the slug when the name changes, but only if the slug is not dirty
  const name = form.watch("name");

  useEffect(() => {
    if (!form.getFieldState("slug").isDirty) {
      form.setValue("slug", slugify(name));
    }
  }, [name]);

  return (
    <div className="flex max-w-[460px] flex-col items-center gap-6">
      <h1 className="text-center font-medium text-2xl">
        Create a new workspace
      </h1>
      <p className="text-center text-foreground">
        Workspaces are shared environments where teams can plan projects
      </p>
      <div className="w-full rounded-lg bg-card p-8 text-card-foreground shadow-lg">
        <Form {...form}>
          <form className="space-y-8">
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem direction="vertical">
                  <FormLabel>Workspace name</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" variant="outline" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="slug"
              render={({ field }) => (
                <FormItem direction="vertical">
                  <FormLabel>Workspace URL</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      prefix="https://mason.com/"
                      spellCheck="false"
                      variant="outline"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
      <Button
        className="w-full max-w-[340px]"
        onClick={form.handleSubmit(onSubmit)}
      >
        Create workspace
      </Button>
    </div>
  );
}
