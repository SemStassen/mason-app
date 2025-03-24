import { toast } from "@mason/ui/sonner";

export function copyCurrentUrlToClipboard({
  successMessage,
  errorMessage = "Failed to copy URL to clipboard",
}: {
  successMessage: string;
  errorMessage?: string;
}) {
  return new Promise((resolve) => {
    try {
      // Get the current URL from the browser
      const currentUrl = window.location.href;

      // Use the modern Clipboard API if available
      if (navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(currentUrl)
          .then(() => {
            toast.success(successMessage);
            resolve(true);
          })
          .catch(() => {
            toast.error(errorMessage);
            resolve(false);
          });
      }

      // Maybe implement a fallback here,
      // but what are the chances somebody with that old of a browser would use this?
      // https://caniuse.com/?search=navigator.clipboard
    } catch (err) {
      resolve(false);
    }
  });
}
