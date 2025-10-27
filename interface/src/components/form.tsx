import { Button, type ButtonProps } from "@mason/ui/button";
import {
  Field,
  FieldControl,
  type FieldControlProps,
  FieldDescription,
  type FieldDescriptionProps,
  FieldError,
  FieldLabel,
  type FieldProps,
  type fieldVariants,
} from "@mason/ui/field";
import { Input, type InputProps } from "@mason/ui/input";
import type { LabelProps } from "@mason/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@mason/ui/select";
import { TimePicker, type TimePickerProps } from "@mason/ui/time-picker";
import {
  createFormHook,
  createFormHookContexts,
  useStore,
} from "@tanstack/react-form";
import type { VariantProps } from "class-variance-authority";
import { formatter } from "~/utils/date-time";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    Field: AppField,
    SelectField: SelectField,
    TextField: TextField,
    TimeField: TimeField,
  },
  formComponents: {
    SubmitButton: SubmitButton,
  },
  fieldContext,
  formContext,
});

function AppField({
  orientation,
  label,
  description,
  render,
}: {
  orientation?: VariantProps<typeof fieldVariants>["orientation"];
  label: Omit<LabelProps, "htmlFor">;
  description?: FieldDescriptionProps;
  render?: FieldControlProps["render"];
}) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <Field orientation={orientation}>
      <FieldLabel {...label} />
      <FieldControl render={render} />
      <FieldDescription {...description} />
      <FieldError errors={errors} />
    </Field>
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
  description?: FieldDescriptionProps;
  orientation?: VariantProps<typeof fieldVariants>["orientation"];
}) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <Field orientation={orientation}>
      <FieldLabel {...label} />
      <FieldControl
        render={(props) => (
          <Input
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            type="text"
            value={field.state.value}
            {...props}
            {...input}
          />
        )}
      />
      <FieldDescription {...description} />
      <FieldError errors={errors} />
    </Field>
  );
}

function TimeField({
  step,
  label,
  input,
  description,
  orientation,
}: {
  step?: TimePickerProps["step"];
  label: Omit<LabelProps, "htmlFor">;
  input?: Omit<InputProps, "id">;
  description?: FieldDescriptionProps;
  orientation?: VariantProps<typeof fieldVariants>["orientation"];
}) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <Field orientation={orientation}>
      <FieldLabel {...label} />
      <FieldControl
        render={(props) => (
          <TimePicker
            format={formatter.time}
            onBlur={field.handleBlur}
            onValueChange={(value) => field.handleChange(value)}
            // @ts-expect-error - TS is being silly here
            step={step}
            // @ts-expect-error - TS is being silly here
            value={new Date(field.state.value)}
            {...props}
            {...input}
          />
        )}
      />

      <FieldDescription {...description} />
      <FieldError errors={errors} />
    </Field>
  );
}

function SelectField<Item extends { id: string }>({
  label,
  items,
  itemValue,
  renderItem,
  renderValue,
  description,
  field,
}: {
  label: Omit<LabelProps, "htmlFor">;
  items: Array<Item>;
  itemValue: (item: Item) => string;
  renderItem: (item: Item) => React.ReactNode;
  renderValue?: (selectedItem?: Item) => React.ReactNode;
  description?: FieldDescriptionProps;
  field?: FieldProps;
}) {
  const fieldCtx = useFieldContext<string>();
  const errors = useStore(fieldCtx.store, (state) => state.meta.errors);

  const selectedItem = items.find((item) => item.id === fieldCtx.state.value);

  return (
    <Field {...field}>
      <FieldLabel {...label} />
      <FieldControl
        render={({ id, className, ...props }) => (
          <Select
            onBlur={fieldCtx.handleBlur}
            onValueChange={(value) => fieldCtx.handleChange(value)}
            value={fieldCtx.state.value}
            {...props}
          >
            <SelectTrigger className={className} id={id}>
              <SelectValue>{renderValue?.(selectedItem)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.id} value={itemValue(item)}>
                  {renderItem(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />

      <FieldDescription {...description} />
      <FieldError errors={errors} />
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
