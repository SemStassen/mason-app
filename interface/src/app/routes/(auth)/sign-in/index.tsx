import { SignInWithGithub } from "@mason/auth/client";
import { Button } from "@mason/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@mason/ui/form";
import { Icons } from "@mason/ui/icons";
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
      <div className="grid flex-1 place-content-center bg-sidebar">
        <div className="space-y-8 rounded-md border p-8">
          <h1 className="font-semibold text-3xl">Sign in to Mason</h1>
          <div>
            <Button
              variant="contrast"
              size="lg"
              className="w-full"
              onClick={async () => await SignInWithGithub()}
            >
              <Icons.Github />
              Sign in with Github
            </Button>
          </div>
          <div className="flex items-center gap-2 text-contrast-90 ">
            <hr className="h-px flex-1 bg-contrast-90" />
            or
            <hr className="h-px flex-1 bg-contrast-90" />
          </div>
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                name=""
                render={({ field }) => (
                  <FormItem direction="vertical">
                    <FormLabel className="hidden">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button size="lg" className="w-full">
                Sign in with email
              </Button>
            </form>
          </Form>
        </div>
      </div>
      <div className="grid flex-1 place-content-center">
        <div className="space-y-4">
          <p className="text-center">Events tracked using Mason</p>
          <div className="flex gap-2 text-3xl [&>span]:w-9 [&>span]:text-center">
            <span className="rounded-md bg-contrast-30 p-2">0</span>
            <span className="rounded-md bg-contrast-30 p-2">0</span>
            <span className="rounded-md bg-contrast-30 p-2">0</span>
            <span className="rounded-md bg-contrast-30 p-2">0</span>
            <span className="rounded-md bg-contrast-30 p-2">1</span>
            <span className="rounded-md bg-contrast-30 p-2">4</span>
            <span className="rounded-md bg-contrast-30 p-2">2</span>
            <span className="rounded-md bg-contrast-30 p-2">6</span>
          </div>
          <p className="text-center text-contrast-75 text-sm">
            This is not *yet* a real counter
          </p>
        </div>
      </div>
    </div>
  );
}
