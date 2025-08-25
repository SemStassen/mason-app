import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Sidebar } from './-components/sidebar';

export const Route = createFileRoute('/$workspaceSlug/(with-sidebar)')({
  component: Layout,
});

function Layout() {
  return (
    <>
      <Sidebar />
      <Outlet />
    </>
  );
}
