import { Metadata } from "next";
import { requireRole } from "@/features/auth/actions";
import { createClient } from "@supabase/supabase-js";
import { JournalManagementDashboard } from "./journal-management-dashboard";

export const metadata: Metadata = {
  title: "Tata Kelola Jurnal — Evaluasi & Peta Verifikasi 100 Poin",
  description:
    "Peta penilaian interaktif seluruh 8 unsur akreditasi Permendikbudristek 134/E/KPT/2021 untuk Jurnal Risenologi dengan link verifikasi langsung.",
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
    { data: deskEval },
    { data: articleAuthors },
  ] = await Promise.all([
    supabase.from("journals").select("*").limit(1).single(),
    supabase.from("reviewers").select("*"),
    supabase.from("editorial_board_members").select("*"),
    supabase.from("editions").select("*"),
    supabase.from("articles").select("id, judul, doi, status, abstrak"),
    supabase.from("desk_evaluation_checks").select("*").limit(1).single(),
    supabase.from("article_authors").select("id, nama, negara, afiliasi"),
  ]);

  return {
    journal: journal || null,
    reviewers: reviewers || [],
    editorialBoard: editorialBoard || [],
    editions: editions || [],
    articles: articles || [],
    deskEval: deskEval || null,
    articleAuthors: articleAuthors || [],
  };
}

export default async function JournalManagementPage() {
  await requireRole(["administrator", "journal_manager", "editor"]);
  const data = await getManagementData();
  return <JournalManagementDashboard data={data} />;
}
