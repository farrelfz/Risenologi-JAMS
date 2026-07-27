import { Metadata } from "next";
import { requireRole } from "@/features/auth/actions";
import { createClient } from "@supabase/supabase-js";
import { SimulatorClient } from "./simulator-client";

export const metadata: Metadata = {
  title: "Simulator Akreditasi",
  description:
    'Simulasi "what-if" — lihat proyeksi skor jika berbagai skenario perbaikan diterapkan.',
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
    { data: articles },
    { data: editions },
  ] = await Promise.all([
    supabase.from("journals").select("*").limit(1).single(),
    supabase.from("reviewers").select("*"),
    supabase.from("editorial_board_members").select("*"),
    supabase.from("articles").select("id, doi, abstrak, status"),
    supabase.from("editions").select("*"),
  ]);
  let deskEval: any = null;
  if (journal) {
    const { data } = await supabase
      .from("desk_evaluation_checks")
      .select("*")
      .eq("journal_id", journal.id)
      .single();
    deskEval = data;
  }
  return {
    journal,
    reviewers: reviewers || [],
    editorialBoard: editorialBoard || [],
    articles: articles || [],
    editions: editions || [],
    deskEval,
  };
}

export default async function SimulatorPage() {
  await requireRole(["administrator", "journal_manager"]);
  const { journal, reviewers, editorialBoard, articles, deskEval } = await getData();

  // Compute base data
  const intlReviewers = reviewers.filter((r: any) => r.kualifikasi_internasional).length;
  const reviewerCountries = Array.from(
    new Set(reviewers.map((r: any) => r.negara).filter(Boolean)),
  );
  const intlRatio = reviewers.length > 0 ? intlReviewers / reviewers.length : 0;
  const edBoardCountries = Array.from(
    new Set(editorialBoard.map((e: any) => e.negara).filter(Boolean)),
  );
  const articlesWithDoi = articles.filter((a: any) => a.doi && a.doi.trim()).length;
  const doiRatio = articles.length > 0 ? articlesWithDoi / articles.length : 0;

  const deskItems = [
    deskEval?.item_1_nama_issn,
    deskEval?.item_2_url_benar,
    deskEval?.item_3_status_sinta,
    deskEval?.item_4_masa_berlaku,
    deskEval?.item_5_etika_cope,
    deskEval?.item_6_akun_demo,
    deskEval?.item_7_frekuensi_terbit,
    deskEval?.item_8_min_artikel_pdf,
  ];
  const deskPassed = deskItems.filter(Boolean).length;

  // Base scores
  const score3A =
    reviewerCountries.length >= 4 && intlRatio > 0.5 ? 6 : reviewerCountries.length >= 2 ? 4 : 2;
  const score3B = edBoardCountries.length >= 4 ? 5 : edBoardCountries.length >= 2 ? 3 : 1;
  const score8C = doiRatio === 1 ? 1 : doiRatio > 0.5 ? 0.5 : 0;
  const baseManagement = 1 + 3 + score3A + score3B + 3.5 + 7 + score8C + 6;
  const baseSubstance = 3 + 1; // cakupan + aspirasi minimal

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Simulator Akreditasi</h1>
        <p className="text-muted-foreground mt-1">
          Simulasi "what-if": proyeksikan dampak skenario perbaikan terhadap estimasi skor sebelum
          mengalokasikan sumber daya.
        </p>
      </div>

      <SimulatorClient
        baseManagement={baseManagement}
        baseSubstance={baseSubstance}
        baseReviewerCountries={reviewerCountries.length}
        baseIntlRatio={intlRatio}
        baseEdBoardCountries={edBoardCountries.length}
        baseDoiRatio={doiRatio}
        baseDeskPassed={deskPassed}
        baseArticleCount={articles.length}
      />
    </div>
  );
}
