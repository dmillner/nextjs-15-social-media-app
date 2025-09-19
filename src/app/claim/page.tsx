import { Metadata } from "next";
import ClaimForm from "./ClaimForm";

export const metadata: Metadata = {
  title: "Claim Your Athlete Profile",
};

interface PageProps {
  searchParams: { username?: string };
}

export default function ClaimPage({ searchParams }: PageProps) {
  const { username } = searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center p-5 bg-background">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-card p-8 shadow-lg">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold">Claim Your Athlete Profile</h1>
          <p className="text-muted-foreground">
            Verify your identity with your official college email to claim your NIL profile
          </p>
        </div>
        <ClaimForm initialUsername={username} />
      </div>
    </main>
  );
}