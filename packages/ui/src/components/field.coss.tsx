import { Field as FieldPrimitive } from "@base-ui-components/react/field";
import { Fieldset as FieldsetPrimitive } from "@base-ui-components/react/fieldset";
import { cva, type VariantProps } from "class-variance-authority";
import { useMemo } from "react";
import { cn } from "../utils";

function Fieldset({ className, ...props }: FieldsetPrimitive.Root.Props) {
  return (
    <FieldsetPrimitive.Root
      className={cn("flex w-full flex-col gap-6", className)}
      data-slot="fieldset"
      {...props}
    />
  );
}
function FieldsetLegend({
  className,
  ...props
}: FieldsetPrimitive.Legend.Props) {
  return (
    <FieldsetPrimitive.Legend
      className={cn("font-semibold", className)}
      data-slot="fieldset-legend"
      {...props}
    />
  );
}

const fieldGroupVariants = cva(
  "group/field-group @container/field-group flex w-full gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4",
  {
    variants: {
      direction: {
        horizontal: "flex-row items-center",
        vertical: "flex-col",
      },
    },
    defaultVariants: {
      direction: "vertical",
    },
  }
);

function FieldGroup({
  className,
  direction,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldGroupVariants>) {
  return (
    <div
      className={cn(fieldGroupVariants({ direction, className }))}
      data-slot="field-group"
      {...props}
    />
  );
}

export interface FieldProps extends FieldPrimitive.Root.Props {
  orientation?: "horizontal" | "vertical";
}
function Field({ className, orientation = "vertical", ...props }: FieldProps) {
  return (
    <FieldPrimitive.Root
      className={cn(
        "flex items-start gap-2",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        className
      )}
      data-slot="field"
      {...props}
    />
  );
}

export interface FieldLabelProps extends FieldPrimitive.Label.Props {}
function FieldLabel({ className, ...props }: FieldLabelProps) {
  return (
    <FieldPrimitive.Label
      className={cn("inline-flex items-center gap-2 text-sm/4", className)}
      data-slot="field-label"
      {...props}
    />
  );
}

export interface FieldDescriptionProps
  extends FieldPrimitive.Description.Props {}
function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return (
    <FieldPrimitive.Description
      className={cn("text-muted-foreground text-xs", className)}
      data-slot="field-description"
      {...props}
    />
  );
}
export interface FieldErrorProps extends FieldPrimitive.Error.Props {
  errors?: Array<{ message?: string }>;
}
function FieldError({
  className,
  errors,
  children,
  ...props
}: FieldErrorProps) {
  const error = useMemo(() => {
    if (!errors?.length) {
      return null;
    }

    const uniqueErrors = [
      ...new Map(errors.map((e) => [e?.message, e])).values(),
    ];

    return uniqueErrors[0]?.message;
  }, [errors]);

  return (
    <FieldPrimitive.Error
      className={cn("text-destructive-foreground text-xs", className)}
      data-slot="field-error"
      {...props}
    >
      {children ? children : <span>{error}</span>}
    </FieldPrimitive.Error>
  );
}

export interface FieldControlProps extends FieldPrimitive.Control.Props {}
const FieldControl = FieldPrimitive.Control;
const FieldValidity = FieldPrimitive.Validity;

export {
  Fieldset,
  FieldsetLegend,
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldControl,
  FieldValidity,
};
