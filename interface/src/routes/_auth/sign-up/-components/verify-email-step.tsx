import { regex } from "@mason/core/shared/utils";
import { Button } from "@mason/ui/button";
import { Field } from "@mason/ui/field";
import { Icons } from "@mason/ui/icons";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@mason/ui/input-otp";
import { revalidateLogic } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Schema } from "effect";
import type { Dispatch, SetStateAction } from "react";

import { useAppForm } from "~/components/form";
import { betterAuthClient } from "~/lib/better-auth";
import {
  createDynamicValidator,
  createParsedSubmitHandler,
  createSubmitValidator,
} from "~/lib/form";
import { m } from "~/paraglide/messages";

import type { SignUpStep } from "..";

const schema = Schema.Struct({
  email: Schema.String.check(Schema.isPattern(regex.email)),
  otp: Schema.String.check(Schema.isLengthBetween(6, 6)),
});

function VerifyEmailStep({
  setCurrentStep,
  email,
}: {
  setCurrentStep: Dispatch<SetStateAction<SignUpStep>>;
  email: string;
}) {
  const navigate = useNavigate();
  const form = useAppForm({
    defaultValues: {
      email: email,
      otp: "",
    } satisfies (typeof schema)["Encoded"],
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createDynamicValidator(schema),
      onSubmitAsync: createSubmitValidator(schema),
    },
    onSubmit: createParsedSubmitHandler(schema, async ({ value }) => {
      await betterAuthClient.signIn.emailOtp({
        email: value.email,
        otp: value.otp,
      });

      navigate({
        to: "/",
      });
    }),
  });

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-center font-medium text-2xl">
          {m.auth_signUp_verifyEmail_heading()}
        </h1>
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field
            children={(field) => (
              <Field>
                <label className="sr-only" htmlFor="otp">
                  {m.auth_signUp_verifyEmail_otp_label()}
                </label>
                <InputOTP
                  id="otp"
                  maxLength={6}
                  onChange={(e) => field.handleChange(e)}
                  value={field.state.value}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </Field>
            )}
            name="otp"
          />
          <form.AppForm>
            <form.SubmitButton className="w-full" size="lg">
              <Icons.Mail />
              {m.auth_signUp_verifyEmail_submit()}
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

export { VerifyEmailStep };
