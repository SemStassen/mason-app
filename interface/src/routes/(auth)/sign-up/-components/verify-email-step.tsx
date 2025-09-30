import { Button } from "@mason/ui/button";
import { useAppForm } from "@mason/ui/form";
import { Icons } from "@mason/ui/icons";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@mason/ui/input-otp";
import { useNavigate } from "@tanstack/react-router";
import { Effect } from "effect";
import type { Dispatch, SetStateAction } from "react";
import z from "zod";
import { MasonClient } from "~/client";
import type { SignUpStep } from "..";

const verifyEmailSchema = z.object({
  email: z.email(),
  otp: z.string().length(6),
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
    } satisfies z.input<typeof verifyEmailSchema>,
    validators: {
      onChange: verifyEmailSchema,
    },
    onSubmit: async ({ value }) => {
      const result = verifyEmailSchema.parse(value);

      await Effect.runPromise(
        MasonClient.Auth.SignInWithEmailOTP({
          payload: {
            ...result,
          },
          withResponse: true,
        }).pipe(
          Effect.catchAll(() => Effect.succeed({ error: "Unexpected error" }))
        )
      );

      navigate({
        to: "/",
      });
    },
  });

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-center font-medium text-2xl">Check your email</h1>
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field
            children={(field) => (
              <>
                <label className="sr-only" htmlFor="otp">
                  One time password
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
              </>
            )}
            name="otp"
          />
          <form.AppForm>
            <form.SubmitButton className="w-full" size="lg">
              <Icons.Mail />
              Continue with login code
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

export { VerifyEmailStep };
