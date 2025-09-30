import {
  createFormHook,
  createFormHookContexts,
  useStore,
} from "@tanstack/react-form";
import { useId } from "react";
import { Button, type ButtonProps } from "./button";
import { Input, type InputProps } from "./input";
import { Label, type LabelProps } from "./label";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField: TextField,
  },
  formComponents: {
    SubmitButton: SubmitButton,
  },
  fieldContext,
  formContext,
});

function useFormIds() {
  const itemId = useId();
  const descriptionId = `${itemId}-form-item-description`;
  const errorId = `${itemId}-form-item-error`;

  return { itemId, descriptionId, errorId };
}

function FormField(props: React.ComponentProps<"div">) {
  return <div className="grid flex-1 gap-2" {...props} />;
}

function FormLabel(props: LabelProps & { htmlFor: string }) {
  return <Label {...props} />;
}

function FormDescription(props: React.ComponentProps<"p"> & { id: string }) {
  if (!props.children) {
    return null;
  }

  return <p className="text-muted-foreground text-sm" {...props} />;
}

function FormMessage({
  errors,
  ...props
  // biome-ignore lint/suspicious/noExplicitAny: errors are from tanstack form
}: React.ComponentProps<"p"> & { id: string; errors: Array<any> }) {
  const body = errors.length > 0 ? errors[0] : props.children;

  if (!body) {
    return null;
  }

  return (
    <p className="text-destructive text-sm" {...props}>
      {body}
    </p>
  );
}

function FormControl({
  errors,
  itemId,
  descriptionId,
  errorId,
  ...props
}: React.ComponentProps<"div"> & {
  // biome-ignore lint/suspicious/noExplicitAny: errors are from tanstack form
  errors: Array<any>;
  itemId: string;
  descriptionId: string;
  errorId: string;
}) {
  return (
    <div
      aria-describedby={
        errors.length > 0 ? `${descriptionId} ${errorId}` : descriptionId
      }
      aria-invalid={errors.length > 0}
      id={itemId}
      {...props}
    />
  );
}

function TextField({
  label,
  input,
  description,
}: {
  label: Omit<LabelProps, "htmlFor">;
  input?: InputProps;
  description?: React.ComponentProps<"p">;
}) {
  const { itemId, descriptionId, errorId } = useFormIds();

  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <FormField>
      <FormLabel htmlFor={itemId} {...label} />
      <FormControl
        descriptionId={descriptionId}
        errorId={errorId}
        errors={errors}
        itemId={itemId}
      >
        <Input
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          type="text"
          value={field.state.value}
          {...input}
        />
      </FormControl>
      <FormDescription {...description} id={descriptionId} />
      <FormMessage errors={errors} id={errorId} />
    </FormField>
  );
}

function SubmitButton(props: ButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button disabled={isSubmitting} type="submit" {...props} />
      )}
    </form.Subscribe>
  );
}

export { useAppForm };
