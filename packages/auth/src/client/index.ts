import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export async function SignInWithGithub() {
  const data = await authClient.signIn.social({
    provider: "github",
  });
}
