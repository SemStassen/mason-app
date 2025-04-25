import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form";

import { type VariantProps, cva } from "class-variance-authority";
import { createContext, useContext, useId } from "react";
import { cn } from "../utils";
import { Description, type DescriptionProps } from "./description";
import { Label, type LabelProps } from "./label";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

const FormSection = ({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) => {
  return (
    <section
      className={cn(
        "rounded-md bg-contrast-5 ring ring-contrast-10",
        className,
      )}
      {...props}
    >
      <ul className="flex flex-col">{children}</ul>
    </section>
  );
};

const formItemVariants = cva(
  "flex justify-between gap-1.5 border-contrast-10 ",
  {
    variants: {
      direction: {
        horizontal: "flex-row border-b last:border-0 sm:items-center",
        vertical: "flex-col",
      },
    },
    defaultVariants: {
      direction: "horizontal",
    },
  },
);

interface FormItemProps
  extends React.ComponentProps<"li">,
    VariantProps<typeof formItemVariants> {}

const FormItem = ({ className, direction, ...props }: FormItemProps) => {
  const id = useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <li
        className={cn(formItemVariants({ direction, className }))}
        {...props}
      />
    </FormItemContext.Provider>
  );
};

const FormLabel = ({ className, ...props }: LabelProps) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
};

const FormControl = ({ ...props }: React.ComponentProps<typeof Slot>) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
};

const FormDescription = ({ className, ...props }: DescriptionProps) => {
  const { formDescriptionId } = useFormField();

  return (
    <Description
      id={formDescriptionId}
      className={cn("mb-0.5 text-contrast-75", className)}
      {...props}
    />
  );
};

const FormMessage = ({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      id={formMessageId}
      className={cn("font-medium text-[0.8rem] text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  );
};

export {
  useFormField,
  Form,
  FormSection,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
