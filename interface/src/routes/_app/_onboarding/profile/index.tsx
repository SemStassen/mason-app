import { User } from "@recount/core/modules/identity";
import { defaultValidationLogic } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Effect, Schema } from "effect";

import { useAppForm } from "~/components/form";
import {
  createDynamicValidator,
  createParsedSubmitHandler,
  createSubmitValidator,
} from "~/lib/form";
import { RecountAtomRpcClient } from "~/lib/rpc/atom-client";
import { runtime } from "~/lib/runtime";

export const Route = createFileRoute("/_app/_onboarding/profile/")({
  component: RouteComponent,
});

const schema = Schema.Struct({
  fullName: User.fields.fullName,
});

function RouteComponent() {
  const navigate = useNavigate();
  const form = useAppForm({
    formId: "profile",
    defaultValues: {
      fullName: "",
    } satisfies (typeof schema)["Encoded"],
    validationLogic: defaultValidationLogic,
    validators: {
      onDynamic: createDynamicValidator(schema),
      onSubmitAsync: createSubmitValidator(schema),
    },
    onSubmit: createParsedSubmitHandler(schema, async ({ value }) => {
      await runtime.runPromise(
        Effect.gen(function* () {
          const client = yield* RecountAtomRpcClient;

          const res = yield* client("User.UpdateMe", {
            fullName: value.fullName,
          });

          // navigate({ to: ""})
        })
      );
    }),
  });

  return (
    <div className="flex w-[320px] flex-col items-center gap-8">
      <h1 className="text-center font-medium text-2xl">Setup profile</h1>
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
                children: "Full name",
              }}
            />
          )}
          name="fullName"
        />
        <form.AppForm>
          <form.SubmitButton className="w-full" size="lg">
            Update profile
          </form.SubmitButton>
        </form.AppForm>
      </form>
    </div>
  );
}
