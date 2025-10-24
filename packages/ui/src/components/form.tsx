import {
  createFormHook,
  createFormHookContexts,
  useStore,
} from "@tanstack/react-form";
import type { VariantProps } from "class-variance-authority";
import { useId } from "react";
import { Button, type ButtonProps } from "./button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  type fieldVariants,
} from "./field";
import { Input, type InputProps } from "./input";
import type { LabelProps } from "./label";
import { TimePicker, type TimePickerProps } from "./time-picker";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField: TextField,
    TimeField: TimeField,
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
  orientation,
}: {
  label: Omit<LabelProps, "htmlFor">;
  input?: InputProps;
  description?: React.ComponentProps<"p">;
  orientation?: VariantProps<typeof fieldVariants>["orientation"];
}) {
  const { itemId, descriptionId, errorId } = useFormIds();

  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <Field orientation={orientation}>
      <FieldLabel htmlFor={itemId} {...label} />
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
      <FieldDescription {...description} id={descriptionId} />
      <FieldError errors={errors} id={errorId} />
    </Field>
  );
}

function TimeField({
  format,
  step,
  label,
  input,
  description,
  orientation,
}: {
  format: TimePickerProps["format"];
  label: Omit<LabelProps, "htmlFor">;
  step?: TimePickerProps["step"];
  input?: InputProps;
  description?: React.ComponentProps<"p">;
  orientation?: VariantProps<typeof fieldVariants>["orientation"];
}) {
  const { itemId, descriptionId, errorId } = useFormIds();

  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <Field orientation={orientation}>
      <FieldLabel htmlFor={itemId} {...label} />
      <FormControl
        descriptionId={descriptionId}
        errorId={errorId}
        errors={errors}
        itemId={itemId}
      >
        <TimePicker
          format={format}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          // @ts-expect-error - TS is being silly here
          step={step}
          type="text"
          value={field.state.value}
          {...input}
        />
      </FormControl>
      <FieldDescription {...description} id={descriptionId} />
      <FieldError errors={errors} id={errorId} />
    </Field>
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
