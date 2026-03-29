import { Workspace } from "@mason/core/modules/workspace";
import { slugify } from "@mason/core/shared/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@mason/ui/input-group";
import { defaultValidationLogic } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Effect, Schema } from "effect";

import { useAppForm } from "~/components/form";
import {
  createDynamicValidator,
  createParsedSubmitHandler,
  createSubmitValidator,
} from "~/lib/form";
import { MasonAtomRpcClient } from "~/lib/rpc/atom-client";
import { runtime } from "~/lib/runtime";

export const Route = createFileRoute("/_app/_onboarding/create-workspace/")({
  component: RouteComponent,
});

const schema = Schema.Struct({
  name: Workspace.fields.name,
  slug: Workspace.fields.slug,
});

function RouteComponent() {
  const navigate = useNavigate();
  const form = useAppForm({
    formId: "create-workspace",
    defaultValues: {
      name: "",
      slug: "",
    } satisfies (typeof schema)["Encoded"],
    validationLogic: defaultValidationLogic,
    validators: {
      onDynamic: createDynamicValidator(schema),
      onSubmitAsync: createSubmitValidator(schema),
    },
    onSubmit: createParsedSubmitHandler(schema, async ({ value }) => {
      await runtime.runPromise(
        Effect.gen(function* () {
          const client = yield* MasonAtomRpcClient;

          const res = yield* client("Workspace.Create", {
            name: value.name,
            slug: value.slug,
          });

          // navigate({ to: ""})
        })
      );
    }),
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
                  dontUpdateMeta: true,
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
                    <InputGroupInput
                      className="*:data-[slot=input]:pl-0!"
                      autoComplete="off"
                      {...props}
                    />
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
                  isDirty: false,
                }));
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
