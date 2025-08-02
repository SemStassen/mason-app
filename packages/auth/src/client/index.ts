import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { localPluginClient } from "./local-plugin";

export const authClient = createAuthClient({
  baseURL: "http://localhost:8002",
  plugins: [organizationClient(), localPluginClient()],
});

export async function signInWithGithub() {
  const data = await authClient.signIn.social({
    provider: "github",
  });
}
