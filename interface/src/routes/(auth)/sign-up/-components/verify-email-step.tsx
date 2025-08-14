import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mason/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@mason/ui/form';
import { Icons } from '@mason/ui/icons';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@mason/ui/input-otp';
import type { Dispatch, SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { masonClient } from '~/client';
import type { SignUpStep } from '..';

const verifyEmailSchema = z.object({
  email: z.email(),
  otp: z.string().length(6),
});

type FormValues = z.infer<typeof verifyEmailSchema>;

function VerifyEmailStep({
  setCurrentStep,
  email,
}: {
  setCurrentStep: Dispatch<SetStateAction<SignUpStep>>;
  email: string;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: email,
      otp: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    await masonClient.auth.authSignInWithEmailOTPRaw({
      authSignInWithEmailOTPRequest: {
        ...data,
      },
    });
    setCurrentStep('verifyEmail');
  };

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-center font-medium text-2xl">Check your email</h1>
        <Form {...form}>
          <form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Email</FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      onChange={field.onChange}
                      value={field.value}
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
                  </FormControl>
                </FormItem>
              )}
            />
            <Button className="w-full" size="lg" type="submit">
              <Icons.Mail />
              Continue with login code
            </Button>
          </form>
        </Form>
      </div>
      <Button
        className="text-muted-foreground text-sm"
        onClick={() => setCurrentStep('chooseMethod')}
        variant="link"
      >
        Back to login
      </Button>
    </>
  );
}

export { VerifyEmailStep };
