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
import { Effect } from "effect";
import { useForm } from "react-hook-form";
import z from "zod";
import { MasonClient } from "~/client";

const setApiKeySchema = z.object({
  apiKey: z.string(),
});

type FormValues = z.infer<typeof setApiKeySchema>;

function SetApiKeyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(setApiKeySchema),
  });

  const onSubmit = async (data: FormValues) => {
    await Effect.runPromise(
      MasonClient.WorkspaceIntegrations.SetApiKey({
        payload: { kind: "float", ...data },
      }).pipe(
        Effect.catchAll(() => Effect.succeed({ error: "Unexpected error" }))
      )
    );
  };

  return (
    <Form {...form}>
      <form
        className="flex items-end gap-2"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Api key</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button>Add API key</Button>
      </form>
    </Form>
  );
}

export { SetApiKeyForm };
