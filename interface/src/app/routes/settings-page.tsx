import { InterfaceAndThemeForm } from "~/components/forms/interface-and-theme-form";
import { ProfileForm } from "~/components/forms/profile-form";

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
        {/* <ProfileForm /> */}
      </div>
    </div>
  );
}

export { SettingsPage };
