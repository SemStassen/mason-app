import { Button } from "@mason/ui/button";
import { Link } from "@tanstack/react-router";
import { m } from "~/paraglide/messages";

function NotFoundPage() {
  return (
    <div className="grid h-screen w-screen place-content-center px-8">
      <div className="flex max-w-[460px] flex-col gap-6">
        <h1 className="font-medium text-2xl">{m["errors.notFound"]()}</h1>
        <p className="text-foreground">
          We try our best to keep Mason error free, but it seems something
          slipped through the cracks.
        </p>
        <Button
          render={<Link to=".">{m["actions.tryAgain"]()}</Link>}
          size="lg"
        />
      </div>
    </div>
  );
}

export { NotFoundPage };
