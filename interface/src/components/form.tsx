import { Button, type ButtonProps } from "@mason/ui/button";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@mason/ui/combobox";
import {
  Field,
  FieldControl,
  type FieldControlProps,
  FieldDescription,
  type FieldDescriptionProps,
  FieldError,
  FieldLabel,
  type FieldLabelProps,
  type FieldProps,
} from "@mason/ui/field";
import { Input, type InputProps } from "@mason/ui/input";
import { InputTime, type InputTimeProps } from "@mason/ui/input-time";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@mason/ui/select";
import { Textarea, type TextareaProps } from "@mason/ui/textarea";
import type { TimePickerProps } from "@mason/ui/time-picker";
import {
  createFormHook,
  createFormHookContexts,
  useStore,
} from "@tanstack/react-form";
import { formatter } from "~/utils/date-time";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    AppField: AppField,
    TextField: TextField,
    TextareaField: TextareaField,
    TimeField: TimeField,
    SelectField: SelectField,
    ComboBoxField: ComboBoxField,
  },
  formComponents: {
    SubmitButton: SubmitButton,
  },
  fieldContext,
  formContext,
});

function AppField({
  label,
  field,
  description,
  control,
}: {
  label: FieldLabelProps;
  field?: FieldProps;
  description?: FieldDescriptionProps;
  control?: FieldControlProps;
}) {
  const fieldCtx = useFieldContext<string>();
  const errors = useStore(fieldCtx.store, (state) => state.meta.errors);

  return (
    <Field {...field}>
      <FieldLabel {...label} />
      <FieldControl
        defaultValue={fieldCtx.options.defaultValue}
        onBlur={fieldCtx.handleBlur}
        onChange={(e) => fieldCtx.handleChange(e.target.value)}
        value={fieldCtx.state.value}
        {...control}
      />
      <FieldDescription {...description} />
      <FieldError errors={errors} />
    </Field>
  );
}

function TextField({
  label,
  field,
  description,
  input,
}: {
  label: FieldLabelProps;
  field?: FieldProps;
  description?: FieldDescriptionProps;
  input?: InputProps;
}) {
  const fieldCtx = useFieldContext<string>();
  const errors = useStore(fieldCtx.store, (state) => state.meta.errors);

  return (
    <Field {...field}>
      <FieldLabel {...label} />
      <Input
        onBlur={fieldCtx.handleBlur}
        type="text"
        value={fieldCtx.state.value}
        onValueChange={(value) => fieldCtx.handleChange(value)}
        {...input}
      />
      <FieldDescription {...description} />
      <FieldError errors={errors} />
    </Field>
  );
}

function TextareaField({
  label,
  field,
  description,
  textarea,
}: {
  label: FieldLabelProps;
  field?: FieldProps;
  description?: FieldDescriptionProps;
  textarea?: TextareaProps;
}) {
  const fieldCtx = useFieldContext<string>();
  const errors = useStore(fieldCtx.store, (state) => state.meta.errors);

  return (
    <Field {...field}>
      <FieldLabel {...label} />
      <Textarea
        onChange={(e) => fieldCtx.handleChange(e.target.value)}
        value={fieldCtx.state.value}
        onBlur={fieldCtx.handleBlur}
        {...textarea}
      />
      <FieldDescription {...description} />
      <FieldError errors={errors} />
    </Field>
  );
}

function TimeField({
  label,
  field,
  description,
  input,
  step,
}: {
  label: FieldLabelProps;
  field?: FieldProps;
  description?: FieldDescriptionProps;
  input?: InputTimeProps;
  step?: TimePickerProps["step"];
}) {
  const fieldCtx = useFieldContext<string | null>();
  const errors = useStore(fieldCtx.store, (state) => state.meta.errors);

  return (
    <Field {...field}>
      <FieldLabel {...label} />
      <InputTime
      format={formatter.time}
      onBlur={fieldCtx.handleBlur}
      onChange={(value: Date | null) => {
        fieldCtx.handleChange(value ? value.toISOString() : null);
      }}
      step={step}
      value={fieldCtx.state.value ? new Date(fieldCtx.state.value) : null}
      {...input}
      />
      <FieldDescription {...description} />
      <FieldError errors={errors} />
    </Field>
  );
}

function SelectField<
  Item extends { label: React.ReactNode; value: string | null },
>({
  label,
  items,
  field,
  description,
}: {
  label: FieldLabelProps;
  items: Array<Item>;
  field?: FieldProps;
  description?: FieldDescriptionProps;
}) {
  const fieldCtx = useFieldContext<string | null>();
  const errors = useStore(fieldCtx.store, (state) => state.meta.errors);

  return (
    <Field {...field}>
      <FieldLabel {...label} />
      <Select
        items={items}
        onValueChange={(value) => fieldCtx.handleChange(value)}
        value={fieldCtx.state.value}
      >
        <SelectTrigger onBlur={fieldCtx.handleBlur}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map(({ label, value }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldDescription {...description} />
      <FieldError errors={errors} />
    </Field>
  );
}

function ComboBoxField<
  Item extends { label: React.ReactNode; value: string | null },
>({
  label,
  items,
  field,
  description,
  placeholder = "Select an item...",
  emptyMessage = "No results found.",
}: {
  label: FieldLabelProps;
  items: Array<Item>;
  field?: FieldProps;
  description?: FieldDescriptionProps;
  placeholder?: string;
  emptyMessage?: string;
}) {
  const fieldCtx = useFieldContext<string | null>();
  const errors = useStore(fieldCtx.store, (state) => state.meta.errors);

  return (
    <Field {...field}>
      <FieldLabel {...label} />
      {/* We need to map the value to the actual item object and onValueChange to the item value */}
      <Combobox items={items} onValueChange={(item) => {fieldCtx.handleChange(item.value)}} value={items.find((item) => item.value === fieldCtx.state.value)} >
        <ComboboxInput placeholder={placeholder} onBlur={fieldCtx.handleBlur}/>
        <ComboboxPopup>
          <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
          <ComboboxList>
            {(item: Item) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxPopup>
      </Combobox>
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
