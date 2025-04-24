import {
  PGliteProvider,
  type PGliteWithExtensions,
  createPGlite,
  sync,
} from "@mason/db/client";
import { TooltipProvider } from "@mason/ui/tooltip";
import { useEffect, useState } from "react";

interface ProvidersProps {
  children: React.ReactNode;
}

function Providers({ children }: ProvidersProps) {
  const [pgForProvider, setPgForProvider] =
    useState<PGliteWithExtensions | null>(null);
  const [syncStatus, setSyncStatus] = useState<"syncing" | "success">(
    "syncing",
  );

  useEffect(() => {
    createPGlite().then(async (pg) => {
      setPgForProvider(pg);
      await sync(pg).then(() => {
        setSyncStatus("success");
      });
    });
  }, []);

  if (!pgForProvider || syncStatus !== "success") {
    return (
      <div className="grid h-screen w-screen place-content-center">
        Mason is Loading...
      </div>
    );
  }

  return (
    <PGliteProvider db={pgForProvider}>
      <TooltipProvider delayDuration={400} disableHoverableContent={true}>
        {children}
      </TooltipProvider>
    </PGliteProvider>
  );
}

export { Providers };
