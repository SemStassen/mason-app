import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@mason/ui/form";
import { Input } from "@mason/ui/input";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

export const Route = createFileRoute("/_auth-layout/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  const form = useForm();

  return (
    <div className="flex h-full">
      <div className="flex-1">
        <Form {...form}>
          <form>
            <FormField
              name=""
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
      <div className="grid flex-1 place-content-center">
        Events tracked using Mason
      </div>
    </div>
  );
}
