import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_onboarding-layout")({
  component: OnboardingLayout,
});

function OnboardingLayout() {
  return (
    <div className="grid h-screen w-screen place-content-center overflow-hidden bg-background px-8 text-foreground">
      <Outlet />
    </div>
  );
}
