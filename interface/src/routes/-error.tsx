import { Button } from "@mason/ui/button";
import { Link } from "@tanstack/react-router";

import { m } from "~/paraglide/messages";

function ErrorPage() {
  return (
    <div className="grid h-screen w-screen place-content-center px-8">
      <div className="flex max-w-[460px] flex-col gap-6">
        <h1 className="font-medium text-2xl">{m.error_unexpected_title()}</h1>
        <p className="text-foreground">{m.error_unexpected_description()}</p>
        <Button render={<Link to=".">{m.action_tryAgain()}</Link>} size="lg" />
      </div>
    </div>
  );
}

export { ErrorPage };
