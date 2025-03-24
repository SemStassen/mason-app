import { type PGliteWithExtensions, createPGlite } from "@mason/db/db";

let pgConnection: PGliteWithExtensions | null = null;

export async function getPGliteConnection() {
  // Create connection if it doesn't exist
  if (!pgConnection) {
    pgConnection = await createPGlite();

    // Connection monitoring.
    // This should always be on the client, but we check just in case
    if (typeof window !== "undefined") {
      // Add visibility change listener to refresh connection when tab becomes active
      document.addEventListener("visibilitychange", async () => {
        if (document.visibilityState === "visible" && pgConnection) {
          try {
            // Test connection with a simple query
            await pgConnection.query("SELECT 1");
          } catch (e) {
            // Recreate connection if test fails
            pgConnection = await createPGlite();
          }
        }
      });
    }
  }

  return pgConnection;
}
