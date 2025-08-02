import type { BetterAuthClientPlugin } from "better-auth";
import { authClient } from ".";
import { getCookie, setCookie } from "./cookies";

export const localPluginClient = () => {
  return {
    id: "local-plugin",
    getActions: ($fetch) => {
      return {
        /**
         * Checks the authentication status of the user.
         * If possible locally, else on the server
         */
        masonCheckAuthStatus: async (options?: {
          forceRefresh?: boolean;
        }): Promise<{
          isLoggedIn: boolean;
        }> => {
          // Check if we think the user is authenticated
          const isLoggedIn = getCookie("loggedIn") === "true";
          if (!options?.forceRefresh && isLoggedIn) {
            return {
              isLoggedIn: true,
            };
          }

          // Check if the user is authenticated on the server
          const { data, error } = await authClient.getSession();

          // Check if the data is valid
          if (error || !data) {
            setCookie("loggedIn", "false");
            return {
              isLoggedIn: false,
            };
          }

          // Response is valid, set the cookie
          setCookie("loggedIn", "true");
          return {
            isLoggedIn: true,
          };
        },
        /**
         * Signs the user out and clears the cookie
         */
        masonSignOut: async () => {
          await authClient.signOut();
          setCookie("loggedIn", "false");
          window.location.reload();
        },
      };
    },
  } satisfies BetterAuthClientPlugin;
};
