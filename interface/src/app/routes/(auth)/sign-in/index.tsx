import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth-layout/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  return <div className="flex w-full flex-col">Sign in</div>;
}
