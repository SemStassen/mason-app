/* oxlint-disable promise/avoid-new */
/* oxlint-disable eslint/no-promise-executor-return */

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
