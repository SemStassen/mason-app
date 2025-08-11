import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$workspaceSlug/')({
  component: () => <div className="text-red-500">Dashboard actually</div>,
});
