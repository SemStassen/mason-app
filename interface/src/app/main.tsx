import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Providers } from "./providers";
import { routeTree } from "./routeTree.gen";
import "@mason/ui/globals.css";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

// Register router for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function MasonInterfaceRoot() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}

export { MasonInterfaceRoot };
