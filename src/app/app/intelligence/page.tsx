import { Metadata } from "next";
import { requireRole } from "@/features/auth/actions";
import { createClient } from "@supabase/supabase-js";
import { runFullJournalAudit } from "@/features/auditor/actions";
import { IntelligenceHubClient } from "./intelligence-hub-client";

export const metadata: Metadata = {
  title: "Pusat Intelijen Akreditasi",
  description:
    "Pusat intelijen gabungan AI Auditor, Rekomendasi, Internasionalisasi, dan Radar Risiko AI.",
};

async function getData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );
  const [
    { data: journal },
    { data: reviewers },
    { data: editorialBoard },
    { data: articleAuthors },
    { data: articles },
    { data: editions },
  ] = await Promise.all([
    supabase.from("journals").select("*").limit(1).single(),
    supabase.from("reviewers").select("*"),
    supabase.from("editorial_board_members").select("*"),
    supabase.from("article_authors").select("*"),
    supabase.from("articles").select("id, judul, doi, abstrak, status"),
    supabase.from("editions").select("*"),
  ]);

  return {
    journal: journal || null,
    reviewers: reviewers || [],
    editorialBoard: editorialBoard || [],
    articleAuthors: articleAuthors || [],
    articles: articles || [],
    editions: editions || [],
  };
}

export default async function IntelligenceHubPage() {
  await requireRole(["administrator", "journal_manager", "editor"]);
  const [initialAudit, data] = await Promise.all([runFullJournalAudit(), getData()]);

  return (
    <div className="space-y-6">
      <IntelligenceHubClient
        initialAudit={initialAudit}
        journal={data.journal}
        reviewers={data.reviewers}
        editorialBoard={data.editorialBoard}
        articleAuthors={data.articleAuthors}
        articles={data.articles}
        editions={data.editions}
      />
    </div>
  );
}
