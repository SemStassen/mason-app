import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mason/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@mason/ui/form';
import { Icons } from '@mason/ui/icons';
import { Input } from '@mason/ui/input';
import type { Dispatch, SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { masonClient } from '~/client';
import type { SignUpStep } from '..';

const enterEmailSchema = z.object({
  email: z.email(),
});

type FormValues = z.infer<typeof enterEmailSchema>;

function EnterEmailStep({
  setCurrentStep,
  setEmail,
}: {
  setCurrentStep: Dispatch<SetStateAction<SignUpStep>>;
  setEmail: Dispatch<SetStateAction<string>>;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(enterEmailSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    await masonClient.auth.authSendEmailVerificationOTPRaw({
      authSendEmailVerificationOTPRequest: {
        type: 'sign-in',
        ...data,
      },
    });
    setCurrentStep('verifyEmail');
  };

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-center font-medium text-2xl">
          What's your email address?
        </h1>
        <Form {...form}>
          <form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Email</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      autoFocus={true}
                      placeholder="Enter your email address..."
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setEmail(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="w-full"
              size="lg"
              type="submit"
              variant="outline"
            >
              <Icons.Mail />
              Continue with Email
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

export { EnterEmailStep };
