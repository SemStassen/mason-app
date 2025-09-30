import { usePGlite } from "@mason/db/client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormSection,
} from "@mason/ui/form2";
import { Input } from "@mason/ui/input";
import { toast } from "@mason/ui/sonner";
import { useForm } from "react-hook-form";
import { rootStore } from "~/stores/root-store";

function ProfileForm() {
  const { appStore } = rootStore;

  const db = usePGlite();

  const form = useForm({
    mode: "onChange",
    // values: {
    //   name: user?.rows[0].name,
    //   displayName: user?.rows[0].display_name,
    // },
  });

  return (
    <Form {...form}>
      <form>
        <FormSection>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => {
              return (
                <FormItem>
                  <div>
                    <FormLabel>Full name</FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      className="sm:max-w-40"
                      {...field}
                      onBlur={async () => {
                        field.onBlur();
                        await db.query(
                          "UPDATE users SET name = $1 WHERE id = $2",
                          [field.value, appStore.userId]
                        );
                        toast("updated");
                      }}
                    />
                  </FormControl>
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => {
              return (
                <FormItem>
                  <div>
                    <FormLabel>Username</FormLabel>
                    <FormDescription>
                      However you want to be called in Mason
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Input
                      className="sm:max-w-40"
                      {...field}
                      onBlur={async () => {
                        field.onBlur();
                        await db.query(
                          "UPDATE users SET display_name = $1 WHERE id = $2",
                          [field.value, appStore.userId]
                        );
                        toast("Updated");
                      }}
                    />
                  </FormControl>
                </FormItem>
              );
            }}
          />
        </FormSection>
      </form>
    </Form>
  );
}

export { ProfileForm };
