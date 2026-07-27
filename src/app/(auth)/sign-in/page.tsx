import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/session";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke Risenologi JAMS — sistem internal pengelola jurnal.",
};

export default async function SignInPage() {
  const user = await getUser();
  if (user) redirect("/app/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="relative w-full max-w-md">
        {/* Background glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-4">
              <span className="text-primary font-bold text-lg">R</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Risenologi JAMS</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Journal Quality Intelligence Platform
            </p>
          </div>

          <SignInForm />

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Sistem internal. Akses hanya untuk tim editorial Risenologi.
          </p>
        </div>
      </div>
    </div>
  );
}
