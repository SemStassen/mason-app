import { regex } from "@recount/core/shared/utils";
import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";
import { revalidateLogic } from "@tanstack/react-form";
import { Schema } from "effect";
import type { Dispatch, SetStateAction } from "react";

import { useAppForm } from "~/components/form";
import { betterAuthClient } from "~/lib/better-auth";
import {
  createDynamicValidator,
  createSubmitValidator,
  createParsedSubmitHandler,
} from "~/lib/form";
import { m } from "~/paraglide/messages";

import type { SignUpStep } from "..";

const schema = Schema.Struct({
  email: Schema.String.check(Schema.isPattern(regex.email)),
});

function EnterEmailStep({
  setCurrentStep,
  setEmail,
}: {
  setCurrentStep: Dispatch<SetStateAction<SignUpStep>>;
  setEmail: Dispatch<SetStateAction<string>>;
}) {
  const form = useAppForm({
    defaultValues: {
      email: "",
    } satisfies (typeof schema)["Encoded"],
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createDynamicValidator(schema),
      onSubmitAsync: createSubmitValidator(schema),
    },
    onSubmit: createParsedSubmitHandler(schema, async ({ value }) => {
      await betterAuthClient.emailOtp.sendVerificationOtp({
        type: "sign-in",
        email: value.email,
      });

      setCurrentStep("verifyEmail");
    }),
  });

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-center font-medium text-2xl">
          {m.auth_signUp_enterEmail_heading()}
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
                  placeholder: m.auth_signUp_enterEmail_email_placeholder(),
                }}
                label={{
                  className: "sr-only",
                  children: m.auth_signUp_enterEmail_email_label(),
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
              {m.auth_signUp_enterEmail_submit()}
            </form.SubmitButton>
          </form.AppForm>
        </form>
      </div>
      <Button
        className="text-muted-foreground text-sm"
        onClick={() => setCurrentStep("chooseMethod")}
        variant="link"
      >
        {m.auth_signUp_back()}
      </Button>
    </>
  );
}

export { EnterEmailStep };
