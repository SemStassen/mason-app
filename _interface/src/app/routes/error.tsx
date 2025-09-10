import { buttonVariants } from "@mason/ui/button";
import { Link } from "@tanstack/react-router";

function ErrorPage() {
  return (
    <div className="grid h-screen w-screen place-content-center px-8">
      <div className="flex max-w-[460px] flex-col gap-6">
        <h1 className="font-medium text-2xl">Something went wrong</h1>
        <p className="text-foreground">
          We try our best to keep Mason error free, but it seems something
          slipped through the cracks.
        </p>
        <div>
          <Link to="." className={buttonVariants({ size: "lg" })}>
            Try again
          </Link>
        </div>
      </div>
    </div>
  );
}

export { ErrorPage };
