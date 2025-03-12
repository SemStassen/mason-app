import { usePGlite } from "@mason/db/db";
import { type User, usersTable } from "@mason/db/schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@mason/ui/form";
import { Input } from "@mason/ui/input";
import { useToast } from "@mason/ui/use-toast";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLiveQuery } from "~/hooks/use-live-query";
import { appStore } from "~/stores/app-store";

function ProfileForm() {
  const { toast } = useToast();

  const db = usePGlite();
  const user = useLiveQuery<User>("SELECT * FROM users");

  console.log(user);

  const form = useForm({
    mode: "onChange",
    values: {
      name: user?.rows[0].name,
      displayName: user?.rows[0].display_name,
    },
  });

  return (
    <Form {...form}>
      <form>
        <section className="bg-muted flex flex-col rounded-md">
          <ul>
            <li>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => {
                  return (
                    <FormItem className="flex items-center gap-2 justify-between p-3">
                      <div>
                        <FormLabel>Full name</FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          className="max-w-40"
                          {...field}
                          onBlur={async () => {
                            field.onBlur();
                            await db.query(
                              "UPDATE users SET name = $1 WHERE uuid = $2",
                              [field.value, appStore.userUuid],
                            );
                            toast({
                              variant: "default",
                              title: "Updated",
                            });
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
            </li>
            <li>
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => {
                  return (
                    <FormItem className="flex items-center gap-2 justify-between p-3">
                      <div>
                        <FormLabel>Username</FormLabel>
                        <FormDescription>
                          However you want to be called in Mason
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Input
                          className="max-w-40"
                          {...field}
                          onBlur={async () => {
                            field.onBlur();
                            await db.query(
                              "UPDATE users SET display_name = $1 WHERE uuid = $2",
                              [field.value, appStore.userUuid],
                            );
                            toast({
                              variant: "default",
                              title: "Updated",
                            });
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
            </li>
          </ul>
        </section>
      </form>
    </Form>
  );
}

export { ProfileForm };
