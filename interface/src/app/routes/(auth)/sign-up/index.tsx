import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth-layout/sign-up")({
  component: SignUpPage,
});

function SignUpPage() {
  return <div className="flex w-full flex-col">Signup</div>;
}
