import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { env } from "./env";

export const betterAuthClient = createAuthClient({
  baseURL: env.VITE_BACKEND_URL,
  fetchOptions: {
    onSuccess: (ctx) => {
      console.log("IMPLEMENT TOKEN STORAGE:", ctx);
    },
    auth: {
      type: "Bearer",
      token: () => {
        console.log("IMPLEMENT TOKEN ADDING");
        return "";
      },
    },
  },
  plugins: [emailOTPClient()],
});
