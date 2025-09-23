import { Button } from "@mason/ui/button";
import { Icons } from "@mason/ui/icons";
import { Separator } from "@mason/ui/separator";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Effect } from "effect";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useState } from "react";
import { MasonClient } from "~/client";
import { EnterEmailStep } from "./-components/enter-email-step";
import { VerifyEmailStep } from "./-components/verify-email-step";

export const Route = createFileRoute("/(auth)/sign-up/")({
  component: SignUpPage,
});

export type SignUpStep = "chooseMethod" | "enterEmail" | "verifyEmail";

function SignUpPage() {
  const [currentStep, setCurrentStep] = useState<SignUpStep>("chooseMethod");
  // Used to share state between the 'enterEmail' and 'verifyEmail' steps
  const [email, setEmail] = useState("");

  const handleGoogleSignUp = async () => {
    await Effect.runPromise(
      MasonClient.OAuth.SignInWithGoogle().pipe(
        Effect.catchAll(() => Effect.succeed({ error: "Unexpected error" }))
      )
    );
  };

  const stepContent: Record<SignUpStep, React.ReactElement> = {
    chooseMethod: (
      <>
        <div className="space-y-6">
          <h1 className="text-center font-medium text-2xl">
            Create your workspace
          </h1>
          <Button className="w-full" onClick={handleGoogleSignUp} size="lg">
            <Icons.Google />
            Continue with Google
          </Button>
          <Separator className="relative">
            <div className="-translate-x-1/2 -translate-y-1/2 -top-full absolute left-1/2 bg-background px-2">
              or
            </div>
          </Separator>
          <div className="space-y-4">
            <Button
              className="w-full"
              onClick={() => setCurrentStep("enterEmail")}
              size="lg"
              variant="outline"
            >
              <Icons.Mail />
              Continue with Email
            </Button>
          </div>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">
            Already have an account?{" "}
          </span>
          <Link className="inline-flex items-center gap-0.5" to="/sign-in">
            Sign in <Icons.ArrowRight />
          </Link>
        </div>
      </>
    ),
    enterEmail: (
      <EnterEmailStep setCurrentStep={setCurrentStep} setEmail={setEmail} />
    ),
    verifyEmail: (
      <VerifyEmailStep email={email} setCurrentStep={setCurrentStep} />
    ),
  };

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className="flex w-[320px] flex-col items-center gap-8"
        exit={{ opacity: 0, scale: 0.9 }}
        initial={{ opacity: 0, scale: 0.9 }}
        key={currentStep}
        transition={{ type: "spring", duration: 0.25 }}
      >
        {stepContent[currentStep]}
      </motion.div>
    </AnimatePresence>
  );
}
