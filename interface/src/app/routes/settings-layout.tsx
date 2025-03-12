import { Outlet } from "react-router";

function SettingsLayout() {
  return (
    <div className="max-w-2xl mx-auto w-full px-10 py-16">
      <Outlet />
    </div>
  );
}

export { SettingsLayout };
