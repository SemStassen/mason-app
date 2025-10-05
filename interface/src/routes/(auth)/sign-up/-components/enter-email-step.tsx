import { Button } from "@mason/ui/button";
import {  useAppForm } from "@mason/ui/form";
import { Icons } from "@mason/ui/icons";
import { Effect } from "effect";
import type { Dispatch, SetStateAction } from "react";
import { z } from "zod";
import { MasonClient } from "~/client";
import type { SignUpStep } from "..";
import { revalidateLogic } from "@tanstack/react-form";

const enterEmailSchema = z.object({
  email: z.email(),
});

const defaultValues: z.input<typeof enterEmailSchema> = {
  email: "",
};

function EnterEmailStep({
  setCurrentStep,
  setEmail,
}: {
  setCurrentStep: Dispatch<SetStateAction<SignUpStep>>;
  setEmail: Dispatch<SetStateAction<string>>;
}) {
  const form = useAppForm({
    defaultValues: defaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: enterEmailSchema,
    },
    onSubmit: async ({ value }) => {
      const result = enterEmailSchema.parse(value);
      await Effect.runPromise(
        MasonClient.Auth.SendEmailVerificationOTP({
          payload: {
            ...result,
            type: "sign-in",
          },
        }).pipe(
          Effect.catchAll(() => Effect.succeed({ error: "Unexpected error" }))
        )
      );
      setCurrentStep("verifyEmail");
    },
  });

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-center font-medium text-2xl">
          What's your email address?
        </h1>
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.AppField
            children={(field) => (
              <field.TextField
                input={{
                  autoComplete: "off",
                  autoFocus: true,
                  placeholder: "Enter your email address...",
                }}
                label={{
                  className: "sr-only",
                  children: "Email",
                }}
              />
            )}
            listeners={{
              onChange: ({ value }) => {
                setEmail(value);
              },
            }}
            name="email"
          />
          <form.AppForm>
            <form.SubmitButton className="w-full" size="lg">
              <Icons.Mail />
              Continue with Email
            </form.SubmitButton>
          </form.AppForm>
        </form>
      </div>
      <Button
        className="text-muted-foreground text-sm"
        onClick={() => setCurrentStep("chooseMethod")}
        variant="link"
      >
        Back to login
      </Button>
    </>
  );
}

export { EnterEmailStep };
