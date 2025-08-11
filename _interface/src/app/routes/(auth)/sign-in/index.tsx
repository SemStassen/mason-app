import { signInWithGithub } from "@mason/auth/client";
import { Button } from "@mason/ui/button";
import {} from "@mason/ui/form";
import { Icons } from "@mason/ui/icons";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth-layout/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  return (
    <div className="flex max-w-[460px] flex-col items-center space-y-6">
      <h1 className="text-center font-medium text-2xl">Sign in to Mason</h1>
      <div>
        <Button
          variant="default"
          size="lg"
          className="w-full"
          onClick={async () => await signInWithGithub()}
        >
          <Icons.Github />
          Sign in with Github
        </Button>
      </div>
    </div>
  );
}
