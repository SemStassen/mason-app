import { Button } from "@mason/ui/button";
import { Icons } from "@mason/ui/icons";
import { Separator } from "@mason/ui/separator";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useState } from "react";

import { betterAuthClient } from "~/lib/better-auth";
import { m } from "~/paraglide/messages";

import { EnterEmailStep } from "./-components/enter-email-step";
import { VerifyEmailStep } from "./-components/verify-email-step";

export const Route = createFileRoute("/_auth/sign-up/")({
  component: SignUpPage,
});

export type SignUpStep = "chooseMethod" | "enterEmail" | "verifyEmail";

function SignUpPage() {
  const [currentStep, setCurrentStep] = useState<SignUpStep>("chooseMethod");
  // Used to share state between the 'enterEmail' and 'verifyEmail' steps
  const [email, setEmail] = useState("");

  const handleGoogleSignUp = async () =>
    await betterAuthClient.signIn.social({
      provider: "google",
    });

  const stepContent: Record<SignUpStep, React.ReactElement> = {
    chooseMethod: (
      <>
        <div className="space-y-6">
          <h1 className="text-center font-medium text-2xl">
            {m.auth_signUp_chooseMethod_heading()}
          </h1>
          <Button className="w-full" onClick={handleGoogleSignUp} size="lg">
            <Icons.Google />
            {m.auth_signUp_chooseMethod_google()}
          </Button>
          <Separator className="relative">
            <div className="-translate-x-1/2 -translate-y-1/2 -top-full absolute left-1/2 bg-background px-2">
              {m.common_or()}
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
              {m.auth_signUp_chooseMethod_email()}
            </Button>
          </div>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">
            {m.auth_signUp_chooseMethod_alreadyHaveAccount()}{" "}
          </span>
          <Link className="inline-flex items-center gap-0.5" to="/sign-in">
            {m.auth_signUp_chooseMethod_signIn()} <Icons.ArrowRight />
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
