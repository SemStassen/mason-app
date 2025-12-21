import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    className="toaster group"
    style={
      {
        "--normal-bg": "var(--color-popover)",
        "--normal-text": "var(--color-popover-foreground)",
        "--normal-border": "var(--color-border)",
        "--error-bg": "var(--color-danger)",
        "--error-text": "var(--color-danger-foreground)",
        "--error-border": "var(--color-danger-border)",
        "--warning-bg": "var(--color-warning)",
        "--warning-text": "var(--color-warning-foreground)",
        "--warning-border": "var(--color-warning-border)",
        "--info-bg": "var(--color-info)",
        "--info-text": "var(--color-info-foreground)",
        "--info-border": "var(--color-info-border)",
        "--success-bg": "var(--color-success)",
        "--success-text": "var(--color-success-foreground)",
        "--success-border": "var(--color-success-border)",
      } as React.CSSProperties
    }
    {...props}
  />
);

export { toast } from "sonner";
export { Toaster };
