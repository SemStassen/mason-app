export const developerDefaultOrigins = [
  "tauri://localhost",
  "http://tauri.localhost",
  "http://localhost:8002",
] as const;

export const getAllowedOrigins = (
  frontendOrigins?: string
): Array<string> => {
  const configuredOrigins = frontendOrigins
    ?.split(",")
    .map((origin: string) => origin.trim())
    .filter((origin: string) => origin.length > 0);

  // Keep deployment-specific origins in env. These defaults are only local
  // developer conveniences so both servers and auth share the same baseline.
  return [...new Set([...developerDefaultOrigins, ...(configuredOrigins ?? [])])];
};
