import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/features/auth/actions";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/sign-in");
  }

  return (
    <div suppressHydrationWarning className="flex min-h-screen bg-transparent">
      <Sidebar profile={profile} />
      <div suppressHydrationWarning className="flex-1 flex flex-col min-w-0">
        <Header profile={profile} />
        <main suppressHydrationWarning className="flex-1 overflow-auto p-6 md:p-8">
          <div suppressHydrationWarning className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <footer className="py-4 px-6 border-t border-border/20 text-center text-xs text-muted-foreground">
          © 2026 Risenologi JAMS — Developed by{" "}
          <span className="font-semibold text-foreground">Muhamad Farrel Dava Fauzan</span>. All
          rights reserved.
        </footer>
      </div>
    </div>
  );
}
