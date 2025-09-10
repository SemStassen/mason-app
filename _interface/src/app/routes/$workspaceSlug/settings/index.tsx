import { authClient } from "@mason/auth/client";
import { Button } from "@mason/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { InterfaceAndThemeForm } from "~/components/forms/interface-and-theme-form";
import { ProfileForm } from "~/components/forms/profile-form";

export const Route = createFileRoute("/$workspaceSlug/_app-layout/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div>
      <div>
        <h2 className="text-2xl">Preferences</h2>
        <div>
          <h3>Interface and theme</h3>
          <InterfaceAndThemeForm />
        </div>
      </div>
      <div>
        <h2 className="text-2xl">Profile</h2>
        <ProfileForm />
      </div>
      <Button onClick={async () => await authClient.masonSignOut()}>
        Log out
      </Button>
    </div>
  );
}
