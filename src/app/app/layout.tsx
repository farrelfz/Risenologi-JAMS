import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/features/auth/actions";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { createClient } from "@supabase/supabase-js";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/sign-in");
  }

  // Fetch journal status_sinta from database
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const { data: journal } = await supabase
    .from("journals")
    .select("id, status_sinta, target_sinta")
    .limit(1)
    .single();

  let currentTotalScore = 68.5;
  if (journal?.id) {
    const { data: scores } = await supabase
      .from("score_estimates")
      .select("skor")
      .eq("entitas_id", journal.id);
    if (scores && scores.length > 0) {
      currentTotalScore = Number(
        scores.reduce((acc: number, s: any) => acc + Number(s.skor || 0), 0).toFixed(1),
      );
    }
  }

  return (
    <div suppressHydrationWarning className="flex min-h-screen bg-transparent">
      <Sidebar
        profile={profile}
        targetSinta={journal?.target_sinta}
        currentScore={currentTotalScore}
      />
      <div suppressHydrationWarning className="flex-1 flex flex-col min-w-0">
        <Header profile={profile} statusSinta={journal?.status_sinta} />
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
