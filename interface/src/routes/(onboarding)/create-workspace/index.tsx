import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(onboarding)/create-workspace/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(onboarding)/create-workspace/"!</div>;
}
