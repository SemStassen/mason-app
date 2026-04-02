import { useAtomSet } from "@effect-atom/atom-react";
import { toastManager } from "@recount/ui/toast";
import { Effect } from "effect";
import z from "zod";

import { createWorkspaceIntegrationAtom } from "~/atoms/api";
import { useAppForm } from "~/components/form";

const createWorkspaceIntegrationSchema = z.object({
  apiKeyUnencrypted: z.string(),
});

function CreateWorkspaceIntegrationForm({ provider }: { provider: "float" }) {
  const createWorkspaceIntegration = useAtomSet(
    createWorkspaceIntegrationAtom,
    {
      mode: "promiseExit",
    }
  );

  const form = useAppForm({
    validators: {
      onChange: createWorkspaceIntegrationSchema,
    },
    onSubmit: async ({ value }) => {
      const result = createWorkspaceIntegrationSchema.parse(value);
      await createWorkspaceIntegration({
        provider: provider,
        ...result,
      }).then((exit) =>
        Effect.runPromise(
          Effect.match(exit, {
            onFailure: () => {
              toastManager.add({
                type: "error",
                title: "Failed to create workspace integration",
              });
            },
            onSuccess: () => {
              toastManager.add({
                type: "error",
                title: "Workspace integration created",
              });
              form.reset();
            },
          })
        )
      );
    },
  });

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppField
        children={(field) => (
          <field.TextField
            label={{
              children: "Api key",
            }}
          />
        )}
        name="apiKeyUnencrypted"
      />
      <form.AppForm>
        <form.SubmitButton>Add API key</form.SubmitButton>
      </form.AppForm>
    </form>
  );
}

export { CreateWorkspaceIntegrationForm };
