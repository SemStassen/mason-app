import { m } from "~/paraglide/messages";

function NotFoundPage() {
  return (
    <div className="grid h-screen w-screen place-content-center px-8">
      <div className="flex max-w-[460px] flex-col gap-6">
        <h1 className="font-medium text-2xl">{m.error_notFound_title()}</h1>
        <p className="text-foreground">{m.error_notFound_description()}</p>
      </div>
    </div>
  );
}

export { NotFoundPage };
