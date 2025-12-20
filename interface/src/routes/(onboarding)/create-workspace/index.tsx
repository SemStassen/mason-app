import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@mason/ui/input-group";
import { defaultValidationLogic } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Effect } from "effect";
import z from "zod";
import { MasonClient } from "~/client";
import { useAppForm } from "~/components/form";
import { slugify } from "~/utils/slugify";

export const Route = createFileRoute("/(onboarding)/create-workspace/")({
  component: RouteComponent,
});

const createWorkspaceSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

const defaultValues: z.input<typeof createWorkspaceSchema> = {
  name: "",
  slug: "",
};

function RouteComponent() {
  const navigate = useNavigate();
  const form = useAppForm({
    defaultValues: defaultValues,
    validators: {
      onDynamic: createWorkspaceSchema,
    },
    validationLogic: defaultValidationLogic,
    onSubmit: async ({ value }) => {
      const result = createWorkspaceSchema.parse(value);

      await Effect.runPromise(
        MasonClient.Workspace.Create({
          payload: result,
        }).pipe(
          Effect.matchEffect({
            onFailure: () => Effect.fail(""),
            onSuccess: (workspace) =>
              Effect.sync(() => navigate({ to: `/${workspace.slug}` })),
          })
        )
      );
    },
  });

  return (
    <div className="flex w-[320px] flex-col items-center gap-8">
      <h1 className="text-center font-medium text-2xl">Create workspace</h1>
      <form
        className="w-full space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.AppField
          children={(field) => (
            <field.TextField
              input={{
                autoComplete: "off",
                autoFocus: true,
              }}
              label={{
                children: "Workspace name",
              }}
            />
          )}
          listeners={{
            onChange: ({ value, fieldApi }) => {
              if (!fieldApi.form.getFieldMeta("slug")?.isDirty) {
                fieldApi.form.setFieldValue("slug", slugify(value), {
                  dontUpdateMeta: true
                });
              }
            },
          }}
          name="name"
        />
        <form.AppField
          children={(field) => (
            <field.AppField
              control={{
                render: (props) => (
                  <InputGroup>
                    <InputGroupInput className="[&>[data-slot=input]]:pl-0!" autoComplete="off" {...props}  />
                    <InputGroupAddon>
                      <InputGroupText>mason.app/</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                ),
              }}
              label={{
                children: "Workspace URL",
              }}
            />
          )}
          listeners={{
            onChange: ({ value, fieldApi }) => {
              if (!value) {
                fieldApi.setMeta((meta) => ({
                  ...meta,
                  isDirty: false
                }))
                
              }
            },
          }}
          name="slug"
        />
        <form.AppForm>
          <form.SubmitButton className="w-full" size="lg">
            Create Workspace
          </form.SubmitButton>
        </form.AppForm>
      </form>
    </div>
  );
}
