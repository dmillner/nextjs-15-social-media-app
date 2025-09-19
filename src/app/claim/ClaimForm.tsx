"use client";

import LoadingButton from "@/components/LoadingButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { claimProfileSchema, ClaimProfileValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import ky from "ky";

interface ClaimFormProps {
  initialUsername?: string;
}

export default function ClaimForm({ initialUsername }: ClaimFormProps) {
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [verificationLink, setVerificationLink] = useState<string>();

  const [isPending, startTransition] = useTransition();

  const form = useForm<ClaimProfileValues>({
    resolver: zodResolver(claimProfileSchema),
    defaultValues: {
      username: initialUsername || "",
      email: "",
    },
  });

  async function onSubmit(values: ClaimProfileValues) {
    setError(undefined);
    setSuccess(undefined);
    setVerificationLink(undefined);

    startTransition(async () => {
      try {
        const response = await ky.post("/api/claim-profile", {
          json: values,
        }).json<{ message: string; verificationLink?: string }>();

        setSuccess(response.message);
        if (response.verificationLink) {
          setVerificationLink(response.verificationLink);
        }
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

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && <p className="text-center text-destructive text-sm">{error}</p>}
          {success && (
            <div className="text-center space-y-2">
              <p className="text-green-600 text-sm">{success}</p>
              {verificationLink && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">
                    For testing purposes, use this verification link:
                  </p>
                  <a
                    href={verificationLink}
                    className="text-primary text-xs break-all hover:underline"
                  >
                    {verificationLink}
                  </a>
                </div>
              )}
            </div>
          )}

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Athlete Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your athlete username (e.g., djlagway)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>College Email (.edu)</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="your.name@university.edu"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <LoadingButton loading={isPending} type="submit" className="w-full">
            Send Verification Email
          </LoadingButton>
        </form>
      </Form>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Already verified?{" "}
          <a href="/login" className="text-primary hover:underline">
            Log in here
          </a>
        </p>
      </div>
    </div>
  );
}