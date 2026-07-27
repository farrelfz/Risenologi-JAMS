import { Metadata } from "next";
import { requireRole } from "@/features/auth/actions";
import { createClient } from "@supabase/supabase-js";
import { JournalManagementDashboard } from "./journal-management-dashboard";

export const metadata: Metadata = {
  title: "Tata Kelola Jurnal",
  description:
    "Progress bar per kategori rubrik Management (49 poin): A, B, C, G, H — berdasarkan data real.",
};

async function getManagementData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const [
    { data: journal },
    { data: reviewers },
    { data: editorialBoard },
    { data: editions },
    { data: articles },
  ] = await Promise.all([
    supabase.from("journals").select("*").limit(1).single(),
    supabase.from("reviewers").select("*"),
    supabase.from("editorial_board").select("*"),
    supabase.from("editions").select("*"),
    supabase.from("articles").select("id, doi, status"),
  ]);

  return {
    journal: journal || null,
    reviewers: reviewers || [],
    editorialBoard: editorialBoard || [],
    editions: editions || [],
    articles: articles || [],
  };
}

export default async function JournalManagementPage() {
  await requireRole(["administrator", "journal_manager", "editor"]);
  const data = await getManagementData();
  return <JournalManagementDashboard data={data} />;
}
