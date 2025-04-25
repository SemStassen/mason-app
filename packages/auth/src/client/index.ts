import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:8002",
  plugins: [organizationClient()],
});

export async function SignInWithGithub() {
  const data = await authClient.signIn.social({
    provider: "github",
  });
}
