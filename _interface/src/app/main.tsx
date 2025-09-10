import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "@mason/ui/globals.css";
import { ErrorPage } from "./routes/error";
import { NotFoundPage } from "./routes/not-found";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultNotFoundComponent: NotFoundPage,
  defaultErrorComponent: ErrorPage,
});

// Register router for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function MasonInterfaceRoot() {
  return <RouterProvider router={router} />;
}

export { MasonInterfaceRoot };
