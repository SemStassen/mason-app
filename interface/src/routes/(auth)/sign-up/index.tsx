import { Button } from '@mason/ui/button';
import { Icons } from '@mason/ui/icons';
import { Input } from '@mason/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@mason/ui/input-otp';
import { Separator } from '@mason/ui/separator';
import { createFileRoute, Link } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import { useState } from 'react';

export const Route = createFileRoute('/(auth)/sign-up/')({
  component: SignUpPage,
});

type ContentState = 'main' | 'email' | 'emailVerification';

function SignUpPage() {
  const [contentState, setContentState] = useState<ContentState>('main');

  const content: Record<ContentState, React.ReactElement> = {
    main: (
      <>
        <div className="space-y-6">
          <h1 className="text-center font-medium text-2xl">
            Create your workspace
          </h1>
          <Button className="w-full" size="lg">
            <Icons.Github />
            Continue with Github
          </Button>
          <Separator className="relative">
            <div className="-translate-x-1/2 -translate-y-1/2 -top-full absolute left-1/2 bg-background px-2">
              or
            </div>
          </Separator>
          <div className="space-y-4">
            <Button
              className="w-full"
              onClick={() => setContentState('email')}
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
            Already have an account?{' '}
          </span>
          <Link className="inline-flex items-center gap-0.5" to="/sign-in">
            Sign in <Icons.ArrowRight />
          </Link>
        </div>
      </>
    ),
    email: (
      <>
        <div className="space-y-6">
          <h1 className="text-center font-medium text-2xl">
            What's your email address?
          </h1>
          <div className="space-y-2">
            <Input placeholder="Enter your email address..." />
            <Button
              className="w-full"
              onClick={() => setContentState('emailVerification')}
              size="lg"
              variant="outline"
            >
              <Icons.Mail />
              Continue with Email
            </Button>
          </div>
        </div>
        <Button
          className="text-muted-foreground text-sm"
          onClick={() => setContentState('main')}
          variant="link"
        >
          Back to login
        </Button>
      </>
    ),
    emailVerification: (
      <>
        <div className="space-y-6">
          <h1 className="text-center font-medium text-2xl">Check your email</h1>
          <div className="space-y-2">
            <InputOTP maxLength={6}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <Button className="w-full" size="lg">
              <Icons.Mail />
              Continue with login code
            </Button>
          </div>
        </div>
        <Button
          className="text-muted-foreground text-sm"
          onClick={() => setContentState('main')}
          variant="link"
        >
          Back to login
        </Button>
      </>
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
        key={contentState}
        transition={{ type: 'spring', duration: 0.25 }}
      >
        {content[contentState]}
      </motion.div>
    </AnimatePresence>
  );
}
