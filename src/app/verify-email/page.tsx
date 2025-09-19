import { Metadata } from "next";
import VerifyEmailForm from "./VerifyEmailForm";

export const metadata: Metadata = {
  title: "Verify Your Email",
};

interface PageProps {
  searchParams: { token?: string };
}

export default function VerifyEmailPage({ searchParams }: PageProps) {
  const { token } = searchParams;

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center p-5 bg-background">
        <div className="w-full max-w-md space-y-6 rounded-2xl bg-card p-8 shadow-lg text-center">
          <h1 className="text-3xl font-bold text-destructive">Invalid Link</h1>
          <p className="text-muted-foreground">
            This verification link is invalid or has expired.
          </p>
          <a
            href="/claim"
            className="inline-block rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Request New Verification
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-5 bg-background">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-card p-8 shadow-lg">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold">Verify Your Email</h1>
          <p className="text-muted-foreground">
            Set your password to complete the verification process
          </p>
        </div>
        <VerifyEmailForm token={token} />
      </div>
    </main>
  );
}