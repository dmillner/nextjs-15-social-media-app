"use client";

import LoadingButton from "@/components/LoadingButton";
import { PasswordInput } from "@/components/PasswordInput";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { verifyEmailSchema, VerifyEmailValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import ky from "ky";

interface VerifyEmailFormProps {
  token: string;
}

export default function VerifyEmailForm({ token }: VerifyEmailFormProps) {
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<{
    message: string;
    username: string;
  }>();

  const [isPending, startTransition] = useTransition();

  const form = useForm<VerifyEmailValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      token,
      password: "",
    },
  });

  async function onSubmit(values: VerifyEmailValues) {
    setError(undefined);
    setSuccess(undefined);

    startTransition(async () => {
      try {
        const response = await ky.post("/api/verify-email", {
          json: values,
        }).json<{ message: string; username: string }>();

        setSuccess(response);
        form.reset();
      } catch (error: any) {
        if (error.response) {
          const errorData = await error.response.json();
          setError(errorData.error || "An error occurred");
        } else {
          setError("Network error. Please try again.");
        }
      }
    });
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-green-600">Profile Claimed Successfully!</h2>
        <p className="text-muted-foreground">{success.message}</p>
        <div className="space-y-2">
          <a
            href={`/users/${success.username}`}
            className="inline-block w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            View Your Profile
          </a>
          <a
            href="/login"
            className="inline-block w-full rounded-lg border border-border px-4 py-2 hover:bg-accent transition-colors"
          >
            Log In to Your Account
          </a>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && <p className="text-center text-destructive text-sm">{error}</p>}

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Create Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="Enter a secure password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <LoadingButton loading={isPending} type="submit" className="w-full">
          Verify Email & Claim Profile
        </LoadingButton>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Need help?{" "}
          <a href="/claim" className="text-primary hover:underline">
            Request a new verification link
          </a>
        </p>
      </div>
    </Form>
  );
}