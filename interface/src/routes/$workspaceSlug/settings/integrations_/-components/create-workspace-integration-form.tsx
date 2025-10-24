import { useAtomSet } from "@effect-atom/atom-react";
import { useAppForm } from "@mason/ui/form";
import { toast } from "@mason/ui/sonner";
import { Effect } from "effect";
import z from "zod";
import { createWorkspaceIntegrationAtom } from "~/atoms/api";

const createWorkspaceIntegrationSchema = z.object({
  apiKeyUnencrypted: z.string(),
});

function CreateWorkspaceIntegrationForm({ kind }: { kind: "float" }) {
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
        kind: kind,
        ...result,
      }).then((exit) =>
        Effect.runPromise(
          Effect.match(exit, {
            onFailure: () => {
              toast.error("Failed to create workspace integration");
            },
            onSuccess: () => {
              toast.success("Workspace integration created");
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
