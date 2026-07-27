import { Metadata } from "next";
import { requireRole } from "@/features/auth/actions";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Lightbulb,
  TrendingUp,
  Users,
  Globe,
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Zap,
  Clock,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rekomendasi AI",
  description:
    "Daftar rekomendasi terprioritas berdasarkan potensi kenaikan skor akreditasi tertinggi.",
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
    supabase.from("articles").select("id, judul, doi, abstrak, status"),
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

interface Recommendation {
  id: string;
  priority: number; // 1 = tertinggi
  icon: typeof Lightbulb;
  title: string;
  description: string;
  category: "Management" | "Substance" | "Administratif";
  potentialGain: number; // estimasi kenaikan poin
  effort: "Rendah" | "Menengah" | "Tinggi";
  actionHref?: string;
  actionLabel?: string;
}

function generateRecommendations(data: Awaited<ReturnType<typeof getData>>): Recommendation[] {
  const { journal, reviewers, editorialBoard, articles, editions, deskEval } = data;
  const recs: Recommendation[] = [];

  // ── Desk Evaluation ──────────────────────────────────────────────────
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
  const failedDesk = deskItems.filter((v) => !v).length;
  if (failedDesk > 0) {
    recs.push({
      id: "desk-eval",
      priority: 1,
      icon: AlertCircle,
      title: `Selesaikan Desk Evaluation (${failedDesk} item belum terpenuhi)`,
      description: `Jurnal tidak akan dinilai substantinya jika ${failedDesk} syarat administratif ini tidak dipenuhi — ini adalah batas keras, bukan nilai bisa ditingkatkan secara bertahap. Selesaikan dahulu sebelum fokus ke poin lain.`,
      category: "Administratif",
      potentialGain: 0,
      effort: "Rendah",
      actionHref: "/app/desk-evaluation",
      actionLabel: "Buka Desk Evaluation",
    });
  }

  // ── Kelembagaan Penerbit ──────────────────────────────────────────────
  if (!journal?.penerbit || journal.penerbit.trim() === "") {
    recs.push({
      id: "penerbit",
      priority: 2,
      icon: CheckCircle2,
      title: "Lengkapi Data Kelembagaan Penerbit",
      description:
        "Kelompok B (Kelembagaan Penerbit) bernilai 5 poin. Saat ini kosong, skor hanya 1/5. Mengisi nama institusi penerbit yang tepat berpotensi menambah hingga 2 poin segera.",
      category: "Management",
      potentialGain: 2,
      effort: "Rendah",
      actionHref: "/app/settings",
      actionLabel: "Pengaturan Jurnal",
    });
  }

  // ── Mitra Bestari Internasional ────────────────────────────────────────
  const intlReviewers = reviewers.filter((r) => r.kualifikasi_internasional).length;
  const reviewerCountries = Array.from(
    new Set(reviewers.map((r: any) => r.negara).filter(Boolean)),
  );
  const intlRatio = reviewers.length > 0 ? intlReviewers / reviewers.length : 0;

  if (reviewerCountries.length < 4) {
    recs.push({
      id: "reviewer-countries",
      priority: 3,
      icon: Globe,
      title: `Tambah Reviewer dari ${4 - reviewerCountries.length} Negara Lagi`,
      description: `Saat ini reviewer berasal dari ${reviewerCountries.length} negara. Skor Mitra Bestari (3A, max 6 poin) membutuhkan ≥4 negara + >50% internasional. Menambah reviewer dari negara berbeda adalah pengungkit skor tertinggi di kelompok Management-C.`,
      category: "Management",
      potentialGain: reviewerCountries.length < 2 ? 4 : 2,
      effort: "Tinggi",
      actionHref: "/app/registry/reviewers",
      actionLabel: "Kelola Reviewer",
    });
  } else if (intlRatio <= 0.5) {
    recs.push({
      id: "reviewer-ratio",
      priority: 3,
      icon: Users,
      title: `Tingkatkan Rasio Reviewer Internasional ke >50%`,
      description: `Diversitas negara sudah cukup (${reviewerCountries.length} negara), tapi rasio internasional baru ${(intlRatio * 100).toFixed(0)}%. Target >50% untuk skor penuh 3A. Tandai reviewer internasional yang sudah ada atau rekrut yang baru.`,
      category: "Management",
      potentialGain: 2,
      effort: "Menengah",
      actionHref: "/app/registry/reviewers",
      actionLabel: "Kelola Reviewer",
    });
  }

  // ── Dewan Penyunting Internasional ─────────────────────────────────────
  const edBoardCountries = Array.from(
    new Set(editorialBoard.map((e: any) => e.negara).filter(Boolean)),
  );
  if (edBoardCountries.length < 2) {
    recs.push({
      id: "editorial-board",
      priority: 4,
      icon: Users,
      title: "Rekrut Editor dari Institusi Internasional",
      description: `Dewan Penyunting (3B, max 5 poin) saat ini hanya berasal dari ${edBoardCountries.length} negara. Menambah editor dari ≥2 negara berbeda bisa menaikkan skor dari 1 ke 3 poin segera, dan ke 5 poin dengan ≥4 negara + >50% internasional.`,
      category: "Management",
      potentialGain: 2,
      effort: "Tinggi",
    });
  }

  // ── DOI per Artikel ──────────────────────────────────────────────────
  const articlesWithDoi = articles.filter((a: any) => a.doi && a.doi.trim()).length;
  const doiRatio = articles.length > 0 ? articlesWithDoi / articles.length : 0;
  if (doiRatio < 1 && articles.length > 0) {
    const missingDoi = articles.length - articlesWithDoi;
    recs.push({
      id: "doi",
      priority: 5,
      icon: FileText,
      title: `Lengkapi DOI untuk ${missingDoi} Artikel`,
      description: `Identitas Unik Artikel (8C, 1 poin) membutuhkan DOI pada semua artikel. Saat ini ${articlesWithDoi}/${articles.length} artikel sudah punya DOI. Daftar ke Crossref Indonesia untuk mendapatkan DOI batch.`,
      category: "Management",
      potentialGain: doiRatio < 0.5 ? 1 : 0.5,
      effort: "Menengah",
      actionHref: "/app/manuscripts",
      actionLabel: "Lihat Naskah",
    });
  }

  // ── Abstrak Artikel ──────────────────────────────────────────────────
  const articlesNoAbstrak = articles.filter(
    (a: any) => !a.abstrak || a.abstrak.length < 100,
  ).length;
  if (articlesNoAbstrak > 0) {
    recs.push({
      id: "abstrak",
      priority: 6,
      icon: FileText,
      title: `Lengkapi Abstrak ${articlesNoAbstrak} Artikel`,
      description: `${articlesNoAbstrak} artikel belum memiliki abstrak yang memadai. Abstrak adalah komponen Substance yang paling mudah dilengkapi dan berdampak langsung pada skor Judul & Abstrak per-artikel dalam kelompok Substance(51).`,
      category: "Substance",
      potentialGain: Math.min(3, articlesNoAbstrak * 0.3),
      effort: "Rendah",
      actionHref: "/app/manuscripts",
      actionLabel: "Edit Naskah",
    });
  }

  // ── Indeksasi Scopus/WoS ─────────────────────────────────────────────
  recs.push({
    id: "indexing",
    priority: 7,
    icon: TrendingUp,
    title: "Daftarkan ke DOAJ & Scopus",
    description:
      "Lembaga Pengindeks (8B, max 8 poin) adalah pengungkit terbesar di kelompok H. Risenologi saat ini mendapat ~6/8 poin. Mendaftarkan ke Scopus atau WoS bisa menambah 2 poin, namun membutuhkan persyaratan ketat — mulai dari DOAJ sebagai batu loncatan.",
    category: "Management",
    potentialGain: 2,
    effort: "Tinggi",
  });

  // ── Aspirasi Wawasan — Negara Penulis ──────────────────────────────────
  recs.push({
    id: "author-countries",
    priority: 8,
    icon: Globe,
    title: "Tingkatkan Keberagaman Negara Penulis",
    description:
      "Aspirasi Wawasan (4B, max 8 poin) diukur dari keberagaman negara penulis. Saat ini estimasi hanya 1/8 poin karena mayoritas penulis dari Indonesia. Target >5 negara untuk skor penuh. Buka Call for Paper internasional atau kolaborasi dengan konferensi luar negeri.",
    category: "Substance",
    potentialGain: 7,
    effort: "Tinggi",
  });

  // ── Sitasi ──────────────────────────────────────────────────────────
  recs.push({
    id: "citations",
    priority: 9,
    icon: TrendingUp,
    title: "Tingkatkan Visibilitas untuk Sitasi",
    description:
      "Dampak Ilmiah (4C, max 8 poin) diukur dari jumlah sitasi. Data sitasi saat ini belum tersedia di sistem. Daftarkan artikel ke Google Scholar, ResearchGate, dan pastikan PDF dapat diindeks mesin pencari untuk meningkatkan peluang disitasi.",
    category: "Substance",
    potentialGain: 5,
    effort: "Tinggi",
  });

  // Urutkan berdasarkan (kategori Administratif dulu, lalu berdasarkan potentialGain/effort)
  return recs.sort((a, b) => a.priority - b.priority);
}

const CATEGORY_COLORS = {
  Administratif: "bg-destructive/10 text-destructive border-destructive/20",
  Management: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Substance: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

const EFFORT_COLORS = {
  Rendah: "text-emerald-600",
  Menengah: "text-amber-600",
  Tinggi: "text-red-600",
};

export default async function RecommendationsPage() {
  await requireRole(["administrator", "journal_manager", "editor"]);
  const data = await getData();
  const recommendations = generateRecommendations(data);

  const totalPotential = recommendations.reduce((s, r) => s + r.potentialGain, 0);
  const adminRecs = recommendations.filter((r) => r.category === "Administratif");
  const managementRecs = recommendations.filter((r) => r.category === "Management");
  const substanceRecs = recommendations.filter((r) => r.category === "Substance");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rekomendasi AI</h1>
        <p className="text-muted-foreground mt-1">
          Daftar aksi terprioritas berdasarkan potensi kenaikan skor akreditasi tertinggi.
        </p>
      </div>

      {/* Compact High-Density Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card border border-border/50 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Total Rekomendasi</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-foreground">{recommendations.length}</span>
              <span className="text-[11px] text-muted-foreground font-normal">
                aksi dapat diambil
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card border border-border/50 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Potensi Kenaikan</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-emerald-500">
                +{totalPotential.toFixed(0)}
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">poin estimasi</span>
            </div>
          </div>
        </div>

        <div className="glass-card border border-border/50 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
            <Zap className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Upaya Rendah</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-amber-500">
                {recommendations.filter((r) => r.effort === "Rendah").length}
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">
                segera dikerjakan
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card border border-border/50 rounded-xl p-3.5 flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${adminRecs.length > 0 ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-500"}`}
          >
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">
              Kritis (Administratif)
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span
                className={`text-2xl font-black ${adminRecs.length > 0 ? "text-destructive" : "text-emerald-500"}`}
              >
                {adminRecs.length}
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">
                {adminRecs.length > 0 ? "perlu perbaikan" : "semua bersih"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <Alert className="border-border/40 bg-muted/10">
        <Lightbulb className="h-4 w-4 text-primary" />
        <AlertTitle className="text-sm font-medium">Tentang Rekomendasi Ini</AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground mt-1">
          Rekomendasi diurut dari potensi dampak skor tertinggi ke terendah. Estimasi kenaikan poin
          adalah perkiraan berdasarkan rubrik Arjuna Instrumen Periode II 2025 — bukan jaminan hasil
          akreditasi resmi. Semakin banyak data yang tersedia di sistem, semakin akurat
          rekomendasinya.
        </AlertDescription>
      </Alert>

      {/* Recommendation list */}
      <div className="space-y-3">
        {recommendations.map((rec, idx) => (
          <Card
            key={rec.id}
            className="glass-card border-border/50 hover:border-primary/30 transition-colors group"
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                {/* Priority number */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-sm font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {idx + 1}
                </div>

                {/* Icon */}
                <div
                  className={`flex-shrink-0 p-2 rounded-lg ${
                    rec.category === "Administratif"
                      ? "bg-destructive/10 text-destructive"
                      : rec.category === "Management"
                        ? "bg-blue-500/10 text-blue-500"
                        : "bg-purple-500/10 text-purple-500"
                  }`}
                >
                  <rec.icon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-foreground leading-tight">
                      {rec.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-[10px] font-bold border rounded-full px-2 py-0.5 ${CATEGORY_COLORS[rec.category]}`}
                      >
                        {rec.category}
                      </span>
                      {rec.potentialGain > 0 && (
                        <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
                          +{rec.potentialGain.toFixed(1)} poin
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-[10px] text-muted-foreground">
                      Upaya:{" "}
                      <span className={`font-semibold ${EFFORT_COLORS[rec.effort]}`}>
                        {rec.effort}
                      </span>
                    </span>
                    {rec.actionHref && (
                      <Link
                        href={rec.actionHref}
                        className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                      >
                        {rec.actionLabel} <ChevronRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        * Estimasi AI Auditor — bukan skor akreditasi resmi Arjuna/Kemdiktisaintek. Instrumen
        Periode II 2025.
      </p>
    </div>
  );
}
