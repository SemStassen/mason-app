import { useAtomSet } from "@effect-atom/atom-react";
import { useAppForm } from "@mason/ui/form";
import z from "zod";
import { upsertWorkspaceIntegrationAtom } from "~/atoms/api";

const upsertWorkspaceIntegrationSchema = z.object({
  apiKeyUnencrypted: z.string(),
});

function UpsertWorkspaceIntegrationForm({ kind }: { kind: "float" }) {
  const upsertWorkspaceIntegration = useAtomSet(upsertWorkspaceIntegrationAtom);
  const form = useAppForm({
    validators: {
      onChange: upsertWorkspaceIntegrationSchema,
    },
    onSubmit: ({ value }) => {
      const result = upsertWorkspaceIntegrationSchema.parse(value);
      upsertWorkspaceIntegration({ kind: kind, ...result });
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

export { UpsertWorkspaceIntegrationForm };
