import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$workspaceSlug/settings/profile/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$workspaceSlug/settings/profile/"!</div>
}
