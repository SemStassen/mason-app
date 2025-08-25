import { createFileRoute } from '@tanstack/react-router';
import { Duration, Effect, Fiber, Schedule } from 'effect';
import { useEffect } from 'react';
import { createMasonClient } from '~/client';
import { usePlatform } from '~/utils/Platform';
import { Calendar } from './-components/calendar';

function WindowActivityPoller() {
  const platform = usePlatform();

  useEffect(() => {
    if (platform.platform !== 'desktop') {
      return;
    }

    const program = Effect.promise(() => platform.captureWindowActivity()).pipe(
      Effect.repeat(Schedule.spaced(Duration.seconds(10)))
    );

    const fiber = Effect.runFork(program);
    return () => {
      Fiber.interrupt(fiber);
    };
  }, [platform]);

  return null;
}

export const Route = createFileRoute('/$workspaceSlug/(with-sidebar)/')({
  beforeLoad: async ({ params, context }) => {
    const MasonClient = createMasonClient(context.platform);

    const workspace = await Effect.runPromise(
      Effect.gen(function* () {
        return yield* MasonClient.Workspace.RetrieveWorkspace({
          payload: {
            workspaceSlug: params.workspaceSlug,
            membersLimit: 100,
          },
        });
      })
    );

    return { workspace: workspace };
  },
  loader: ({ context }) => {
    return context;
  },
  component: () => {
    return (
      <div className="flex-1">
        {/* <WindowActivityPoller /> */}
        <Calendar />
      </div>
    );
  },
});
