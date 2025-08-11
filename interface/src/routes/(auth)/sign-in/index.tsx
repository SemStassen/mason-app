import { Button } from '@mason/ui/button';
import { Icons } from '@mason/ui/icons';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(auth)/sign-in/')({
  component: SignInPage,
});

function SignInPage() {
  return (
    <div className="w-[320px] space-y-6">
      <h1 className="text-center font-medium text-2xl">Sign in to Mason</h1>
      <Button className="w-full" size="lg">
        <Icons.Github />
        Sign in with Github
      </Button>
    </div>
  );
}
