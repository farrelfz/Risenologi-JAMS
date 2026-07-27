"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/features/auth/actions";

export function SignInForm() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await signIn(formData);

    if (result?.success === false) {
      if (result.errors) {
        setErrors(result.errors as Record<string, string[]>);
      } else if (result.error) {
        toast.error(result.error);
      }
      setLoading(false);
    }
    // If successful, redirect happens server-side
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="admin@risenologi.kpmunj.org"
          autoComplete="email"
          className="bg-background/50"
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-xs text-destructive">
            {errors.email[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          className="bg-background/50"
          aria-describedby={errors.password ? "password-error" : undefined}
        />
        {errors.password && (
          <p id="password-error" className="text-xs text-destructive">
            {errors.password[0]}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading} id="sign-in-submit">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Masuk...
          </>
        ) : (
          "Masuk ke Sistem"
        )}
      </Button>
    </form>
  );
}
