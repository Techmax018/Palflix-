import Link from "next/link";
import { Flame, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex max-w-sm flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <MailCheck className="h-8 w-8 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Check your email
        </h1>
        <p className="mt-2 text-muted-foreground">
          We sent you a confirmation link. Please check your inbox and click the
          link to verify your account.
        </p>
        <Button asChild variant="outline" className="mt-8 bg-transparent">
          <Link href="/auth/login">Back to Sign In</Link>
        </Button>
      </div>
    </div>
  );
}
