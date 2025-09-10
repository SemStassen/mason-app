// biome-ignore lint/suspicious/useAwait: Fine for util
export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
