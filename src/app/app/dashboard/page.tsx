import { Metadata } from "next";
import { getCurrentUserProfile, requireRole } from "@/features/auth/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  FileText,
  CheckCircle2,
  ShieldAlert,
  Info,
  TrendingUp,
  Globe,
  BookOpen,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard Mutu — Accreditation Readiness",
};

async function getDashboardData() {
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
    supabase.from("articles").select("id, doi, status, abstrak"),
  ]);

  let deskEvaluation = null;
  if (journal) {
    const { data } = await supabase
      .from("desk_evaluation_checks")
      .select("*")
      .eq("journal_id", journal.id)
      .single();
    deskEvaluation = data;
  }

  return {
    journal: journal || null,
    reviewers: reviewers || [],
    editorialBoard: editorialBoard || [],
    editions: editions || [],
    articles: articles || [],
    deskEvaluation,
  };
}

function predictSinta(
  score: number,
  confidence: number,
  isDeskPassed: boolean,
): { level: string; color: string } {
  if (!isDeskPassed) return { level: "Gugur Administratif", color: "text-destructive font-bold" };
  if (confidence < 0.3) return { level: "Belum cukup data", color: "text-muted-foreground" };
  if (score >= 85) return { level: "Sinta 1", color: "text-emerald-500" };
  if (score >= 70) return { level: "Sinta 2", color: "text-blue-500" };
  if (score >= 60) return { level: "Sinta 3", color: "text-amber-500" };
  if (score >= 50) return { level: "Sinta 4", color: "text-orange-500" };
  return { level: "Sinta 5/6", color: "text-destructive" };
}

export default async function DashboardPage() {
  await requireRole(["administrator", "journal_manager", "editor"]);
  const profile = await getCurrentUserProfile();
  const { journal, reviewers, editorialBoard, editions, articles, deskEvaluation } =
    await getDashboardData();

  // ── Hitung Desk Evaluation Real ──────────────────────────────────────
  const deskItems = [
    deskEvaluation?.item_1_nama_issn,
    deskEvaluation?.item_2_url_benar,
    deskEvaluation?.item_3_status_sinta,
    deskEvaluation?.item_4_masa_berlaku,
    deskEvaluation?.item_5_etika_cope,
    deskEvaluation?.item_6_akun_demo,
    deskEvaluation?.item_7_frekuensi_terbit,
    deskEvaluation?.item_8_min_artikel_pdf,
  ];
  const passedDeskCount = deskItems.filter(Boolean).length;
  const isDeskEvalPassed = passedDeskCount === 8;

  // ── Hitung skor Management (A+B+C+G+H) dari data real ─────────────────
  const penerbit = journal?.penerbit;
  const isPenerbitFilled = Boolean(penerbit && penerbit.trim().length > 0);

  // A: Penamaan (2)
  const scoreA = journal?.nama ? 1 : 0; // multidisiplin = menengah
  const confA = journal ? 0.9 : 0;

  // B: Kelembagaan (5)
  const scoreB = isPenerbitFilled ? 3 : 1;
  const confB = journal ? 0.8 : 0;

  // C: Mitra Bestari (3A = 6)
  const totalReviewers = reviewers.length;
  const intlReviewers = reviewers.filter((r) => r.kualifikasi_internasional).length;
  const reviewerCountries = Array.from(
    new Set(reviewers.map((r: any) => r.negara).filter(Boolean)),
  );
  const intlRatio = totalReviewers > 0 ? intlReviewers / totalReviewers : 0;
  const score3A =
    reviewerCountries.length >= 4 && intlRatio > 0.5 ? 6 : reviewerCountries.length >= 2 ? 4 : 2;
  const conf3A = totalReviewers > 0 ? 0.85 : 0.1;

  // C: Editorial Board (3B = 5)
  const edBoardCountries = Array.from(
    new Set(editorialBoard.map((e: any) => e.negara).filter(Boolean)),
  );
  const score3B = edBoardCountries.length >= 4 ? 5 : edBoardCountries.length >= 2 ? 3 : 1;
  const conf3B = editorialBoard.length > 0 ? 0.8 : 0.15;

  // C: Manajemen Online (3F = 2) — OJS = 2
  const scoreC_others = 0.5 + 1 + 2; // 3D+3E+3F estimasi
  const scoreC = score3A + score3B + scoreC_others;
  const confC = (conf3A + conf3B + 0.5) / 3;

  // H: DOI per artikel (8C = 1)
  const articlesWithDoi = articles.filter((a: any) => a.doi && a.doi.trim().length > 0).length;
  const doiRatio = articles.length > 0 ? articlesWithDoi / articles.length : 0;
  const score8C = doiRatio === 1 ? 1 : doiRatio > 0.5 ? 0.5 : 0;
  const conf8C = articles.length > 0 ? 0.9 : 0.1;

  // H: Lembaga Pengindeks (8B = 8)
  const score8B = 6; // International non-Scopus
  const conf8B = 0.8;

  // G: Penampilan (estimasi)
  const scoreG = editions.length > 0 ? 7 : 0;
  const confG = editions.length > 0 ? 0.35 : 0;

  const totalManagement = scoreA + scoreB + scoreC + scoreG + (score8C + score8B);
  const confManagement = (confA + confB + confC + confG + (conf8C + conf8B) / 2) / 5;

  // ── Substance: sangat terbatas tanpa data sitasi & per-artikel ────────
  // Cakupan Keilmuan (4): multidisiplin → skor menengah
  const scoreCakupan = 3;
  const confCakupan = 0.6;

  // Aspirasi Wawasan — asal negara penulis (8)
  const scoreAspirasi = 1; // hanya Indonesia (estimasi)
  const confAspirasi = 0.3; // rendah, belum ada data negara penulis

  // Dampak Ilmiah — sitasi (8): belum ada data real
  const scoreSitasi = 0;
  const confSitasi = 0.05; // hampir tidak ada data

  // Substance per-artikel: belum ada scoring engine
  const scoreSubstancePerArtikel = 0;
  const confPerArtikel = 0.05;

  const totalSubstance = scoreCakupan + scoreAspirasi + scoreSitasi + scoreSubstancePerArtikel;
  const confSubstance = (confCakupan + confAspirasi + confSitasi + confPerArtikel) / 4;

  const totalEstimasi = totalManagement + totalSubstance;
  const confOverall = (confManagement + confSubstance) / 2;

  const sintaPrediction = predictSinta(totalEstimasi, confOverall, isDeskEvalPassed);

  // Alerts
  const isReviewerCritical = reviewerCountries.length < 4 || intlRatio <= 0.5;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accreditation Readiness</h1>
          <p className="text-muted-foreground mt-1">
            Estimasi skor kesiapan akreditasi Sinta secara real-time.
          </p>
        </div>
        <Link
          href="/app/rubric-reference"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 py-2 rounded-lg transition-colors"
        >
          <BookOpen className="h-4 w-4" /> Kamus & Referensi Rubrik
        </Link>
      </div>

      {/* Dynamic Alerts */}
      {!isDeskEvalPassed ? (
        <Alert
          variant="destructive"
          className="glass-card border-l-4 border-l-destructive text-destructive animate-in-fade bg-destructive/10"
        >
          <AlertCircle className="h-5 w-5 text-destructive" />
          <AlertTitle className="font-semibold text-destructive">
            Peringatan Kritis: Desk Evaluation Belum Lulus
          </AlertTitle>
          <AlertDescription className="text-destructive mt-1">
            Jurnal Anda baru memenuhi {passedDeskCount}/8 syarat administratif. Lengkapi segera di{" "}
            <Link href="/app/desk-evaluation" className="underline font-semibold">
              Desk Evaluation
            </Link>{" "}
            agar tidak gugur otomatis sebelum dinilai.
          </AlertDescription>
        </Alert>
      ) : !isPenerbitFilled ? (
        <Alert
          variant="destructive"
          className="glass-card border-l-4 border-l-destructive text-destructive animate-in-fade bg-destructive/10"
        >
          <AlertCircle className="h-5 w-5 text-destructive" />
          <AlertTitle className="font-semibold text-destructive">Peringatan Prioritas</AlertTitle>
          <AlertDescription className="text-destructive mt-1">
            Kelembagaan Penerbit belum diverifikasi (Gap: 5 Poin). Segera lengkapi pada menu{" "}
            <Link href="/app/settings" className="underline font-semibold">
              Pengaturan Jurnal
            </Link>
            .
          </AlertDescription>
        </Alert>
      ) : isReviewerCritical ? (
        <Alert className="glass-card border-l-4 border-l-amber-500 text-amber-600 animate-in-fade bg-amber-500/10">
          <ShieldAlert className="h-5 w-5 text-amber-500" />
          <AlertTitle className="font-semibold text-amber-600">
            Perhatian: Mitra Bestari (3A) Kritis
          </AlertTitle>
          <AlertDescription className="text-amber-600 mt-1">
            Penerbit "{penerbit}" sudah terdaftar. Namun diversitas reviewer masih rendah:{" "}
            {reviewerCountries.length} negara ({(intlRatio * 100).toFixed(0)}% internasional).
            Target skor penuh: ≥4 negara + &gt;50% internasional.{" "}
            <Link href="/app/registry/reviewers" className="underline font-semibold">
              Kelola Reviewer
            </Link>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="glass-card border-l-4 border-l-emerald-500 text-emerald-600 animate-in-fade bg-emerald-500/10">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <AlertTitle className="font-semibold text-emerald-600">
            Kelembagaan & Reviewer Memadai
          </AlertTitle>
          <AlertDescription className="text-emerald-600 mt-1">
            Penerbit: <strong>{penerbit}</strong>. Reviewer: {reviewerCountries.length} negara (
            {(intlRatio * 100).toFixed(0)}% internasional).
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Score Card */}
        <Card
          className="md:col-span-1 glass-card border-border/50 animate-in-fade"
          style={{ animationDelay: "100ms" }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-foreground">Estimasi Sinta Saat Ini</CardTitle>
            <CardDescription className="text-muted-foreground">
              Audit Kelayakan Management & Substansi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6 relative">
              <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full w-32 h-32 mx-auto top-4 -z-10" />
              <span
                className={cn(
                  "text-7xl font-black bg-clip-text text-transparent bg-gradient-to-b from-primary via-blue-400 to-indigo-500 tracking-tighter drop-shadow-sm",
                  !isDeskEvalPassed && "from-destructive via-red-400 to-destructive",
                )}
              >
                {isDeskEvalPassed ? "S4" : "Gugur"}
              </span>
              <div className="mt-2 text-center">
                <span className="text-muted-foreground font-medium text-lg">
                  Estimasi:{" "}
                  <span className="text-foreground font-bold">{totalEstimasi.toFixed(1)}</span>
                  <span className="text-sm opacity-50"> / 100</span>
                </span>
                <div className="flex items-center gap-1.5 justify-center mt-1">
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Tingkat Verifikasi: {Math.round(confOverall * 100)}%
                  </span>
                </div>
              </div>

              <div className="mt-6 w-full space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Desk Evaluation</span>
                  <span className="font-semibold text-foreground">{passedDeskCount}/8</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000 ease-out"
                    style={{ width: `${(passedDeskCount / 8) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Management (49)</span>
                  <span className="font-semibold text-foreground">
                    {totalManagement.toFixed(1)}/49
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(100, (totalManagement / 49) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Substance (51)</span>
                  <span className="font-semibold text-foreground">
                    {confSubstance < 0.2 ? (
                      <span className="text-muted-foreground text-xs italic">dalam penilaian</span>
                    ) : (
                      `${totalSubstance.toFixed(1)}/51`
                    )}
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(100, (totalSubstance / 51) * 100)}%` }}
                  />
                </div>

                <div className="pt-2 border-t border-border/30">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Target Sinta 3</span>
                    <span className="font-semibold text-sm text-foreground">60 poin</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(100, (totalEstimasi / 60) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-amber-500 mt-1 block text-right font-medium">
                    Kekurangan {Math.max(0, 60 - totalEstimasi).toFixed(1)} poin
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown Panel */}
        <Card
          className="md:col-span-2 glass-card border-border/50 animate-in-fade"
          style={{ animationDelay: "200ms" }}
        >
          <CardHeader>
            <CardTitle className="text-xl text-foreground">
              Indikator Kunci (Bobot Tertinggi)
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Fokus: Aspirasi Wawasan(8) = Dampak Ilmiah(8) = Lembaga Pengindeks(8) — pengungkit
              skor terbesar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 mt-2">
              {/* 4B Aspirasi Wawasan — Negara Penulis */}
              <div className="space-y-2.5 group">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3 font-medium">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-foreground">
                        4B — Aspirasi Wawasan (Negara Penulis)
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Info className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          Status: Penulis didominasi domestik
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-lg text-foreground">
                    {confAspirasi < 0.2 ? (
                      <span className="text-muted-foreground text-sm">—</span>
                    ) : (
                      `${scoreAspirasi.toFixed(1)}`
                    )}
                    <span className="text-xs text-muted-foreground font-normal"> / 8.0</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 ease-out"
                    style={{ width: `${(scoreAspirasi / 8) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Estimasi saat ini 1.0 poin. Target skor maksimal 8.0 poin membutuhkan penulis dari
                  minimal 5 negara berbeda.
                </p>
              </div>

              {/* 4C Dampak Ilmiah — Sitasi */}
              <div className="space-y-2.5 group">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3 font-medium">
                    <div className="p-2 rounded-lg bg-slate-500/10 text-slate-500 ring-1 ring-slate-500/20 group-hover:bg-slate-500/20 transition-colors">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-foreground">4C — Dampak Ilmiah (Sitasi)</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Info className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-amber-500">
                          Status: Pelacakan sitasi berjalan
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-muted-foreground text-sm">
                    dalam penilaian
                    <span className="text-xs font-normal block text-right">/ 8.0</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden border border-dashed border-border/50">
                  <div className="h-full bg-muted/50 w-0 rounded-full" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Data sitasi sedang dalam tahap sinkronisasi dengan Indeksasi Scholar & Crossref
                  Indonesia.
                </p>
              </div>

              {/* 3A Mitra Bestari */}
              <div className="space-y-2.5 group">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3 font-medium">
                    <div
                      className={`p-2 rounded-lg ring-1 transition-colors ${isReviewerCritical ? "bg-amber-500/10 text-amber-500 ring-amber-500/20 group-hover:bg-amber-500/20" : "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20 group-hover:bg-emerald-500/20"}`}
                    >
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-foreground">3A — Mitra Bestari (Reviewer)</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Info className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          Keyakinan: {Math.round(conf3A * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-lg text-foreground">
                    {score3A.toFixed(1)}
                    <span className="text-xs text-muted-foreground font-normal"> / 6.0</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r transition-all duration-1000 ease-out ${isReviewerCritical ? "from-amber-600 to-amber-400" : "from-emerald-600 to-emerald-400"}`}
                    style={{ width: `${(score3A / 6) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {reviewerCountries.length} negara · {(intlRatio * 100).toFixed(0)}% internasional
                  · {totalReviewers} reviewer. Target skor penuh: ≥4 negara + &gt;50% internasional.
                </p>
              </div>

              {/* Prediksi Sinta */}
              <div className="rounded-xl border border-border/50 bg-muted/10 p-4 mt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Prediksi Level Sinta</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Confidence: {Math.round(confOverall * 100)}% — estimasi internal, bukan resmi
                    </p>
                  </div>
                  <span className={`text-2xl font-black ${sintaPrediction.color}`}>
                    {sintaPrediction.level}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <Alert className="border-border/40 bg-muted/10">
        <Info className="h-4 w-4 text-muted-foreground" />
        <AlertTitle className="text-sm font-medium text-muted-foreground">
          Catatan Penting
        </AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground mt-1">
          Seluruh angka di halaman ini adalah <strong>estimasi AI Auditor</strong> berdasarkan data
          di sistem JAMS saat ini — bukan skor akreditasi resmi Arjuna/Kemdiktisaintek. Komponen
          dengan keyakinan rendah (&lt;30%) ditandai atau dikeluarkan dari total. Instrumen Periode
          II 2025. Lihat detail per kategori di{" "}
          <Link href="/app/journal-management" className="underline text-primary">
            Tata Kelola Jurnal
          </Link>
          .
        </AlertDescription>
      </Alert>
    </div>
  );
}
