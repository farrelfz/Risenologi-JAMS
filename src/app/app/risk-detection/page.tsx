import { Metadata } from "next";
import { requireRole } from "@/features/auth/actions";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Shield,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Activity,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Deteksi Risiko AI",
  description:
    "Radar lima kategori risiko lintas proses editorial — agar masalah terdeteksi sebelum menjadi krisis akreditasi.",
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
    supabase.from("articles").select("id, judul, doi, abstrak, status, created_at"),
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

interface RiskItem {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: "HIGH" | "MEDIUM" | "LOW" | "OK";
  evidence: string;
  recommendation: string;
}

function assessRisks(data: Awaited<ReturnType<typeof getData>>): RiskItem[] {
  const { journal, reviewers, editorialBoard, articles, editions, deskEval } = data;

  const risks: RiskItem[] = [];

  // ── 1. Diversitas Reviewer ─────────────────────────────────────────
  const intlReviewers = reviewers.filter((r) => r.kualifikasi_internasional).length;
  const reviewerCountries = Array.from(
    new Set(reviewers.map((r: any) => r.negara).filter(Boolean)),
  );
  const intlRatio = reviewers.length > 0 ? intlReviewers / reviewers.length : 0;

  let reviewerSeverity: RiskItem["severity"] = "LOW";
  let reviewerEvidence = `${reviewers.length} reviewer dari ${reviewerCountries.length} negara, ${(intlRatio * 100).toFixed(0)}% internasional.`;
  let reviewerRec =
    "Diversitas reviewer sudah memadai. Pertahankan dan perbarui data secara berkala.";

  if (reviewers.length === 0) {
    reviewerSeverity = "HIGH";
    reviewerEvidence = "Tidak ada data reviewer di sistem.";
    reviewerRec = "Segera masukkan data reviewer ke Registry.";
  } else if (reviewerCountries.length < 2 || intlRatio <= 0.3) {
    reviewerSeverity = "HIGH";
    reviewerRec =
      "Rekrut reviewer dari minimal 4 negara berbeda dan pastikan >50% berlabel internasional.";
  } else if (reviewerCountries.length < 4 || intlRatio <= 0.5) {
    reviewerSeverity = "MEDIUM";
    reviewerRec = `Tambahkan reviewer dari ${4 - reviewerCountries.length} negara lagi dan tingkatkan rasio internasional ke >50%.`;
  } else {
    reviewerSeverity = "OK";
  }

  risks.push({
    id: "reviewer-diversity",
    category: "Diversitas Reviewer",
    title: "Keanekaragaman Mitra Bestari",
    description:
      "Mempengaruhi skor 3A (Mitra Bestari, 6 poin). Risiko tinggi jika reviewer terlalu homogen.",
    severity: reviewerSeverity,
    evidence: reviewerEvidence,
    recommendation: reviewerRec,
  });

  // ── 2. Mutu Referensi ──────────────────────────────────────────────
  const articlesWithDoi = articles.filter((a: any) => a.doi && a.doi.trim()).length;
  const doiRatio = articles.length > 0 ? articlesWithDoi / articles.length : 0;
  const articlesNoAbstrak = articles.filter((a: any) => !a.abstrak || a.abstrak.length < 50).length;

  let refSeverity: RiskItem["severity"] = "LOW";
  let refEvidence = `${articlesWithDoi}/${articles.length} artikel memiliki DOI. ${articlesNoAbstrak} artikel tanpa abstrak memadai.`;
  let refRec =
    "Kualitas metadata artikel sudah baik. Pertahankan standar ini untuk edisi berikutnya.";

  if (doiRatio < 0.5 || articlesNoAbstrak > articles.length * 0.3) {
    refSeverity = "HIGH";
    refRec =
      "Lengkapi DOI dan abstrak segera — ini komponen paling mudah diperbaiki dengan dampak langsung ke skor Substance.";
  } else if (doiRatio < 1 || articlesNoAbstrak > 0) {
    refSeverity = "MEDIUM";
    refRec = `Lengkapi ${articles.length - articlesWithDoi} artikel yang belum memiliki DOI dan ${articlesNoAbstrak} artikel yang abstraknya kurang.`;
  } else {
    refSeverity = "OK";
    refEvidence = `Semua ${articles.length} artikel sudah memiliki DOI dan abstrak yang lengkap.`;
  }

  risks.push({
    id: "reference-quality",
    category: "Mutu Referensi",
    title: "Kelengkapan Metadata Artikel",
    description:
      "DOI dan abstrak yang lengkap mempengaruhi skor Substance per-artikel dan identitas unik di indeksasi.",
    severity: refSeverity,
    evidence: refEvidence,
    recommendation: refRec,
  });

  // ── 3. Keterlambatan Publikasi ─────────────────────────────────────
  const publishedArticles = articles.filter((a: any) => a.status === "terbit");
  const latestEditionDate =
    editions.length > 0
      ? new Date(
          editions.sort(
            (a: any, b: any) =>
              new Date(b.tanggal_terbit || b.created_at).getTime() -
              new Date(a.tanggal_terbit || a.created_at).getTime(),
          )[0]?.tanggal_terbit || editions[0]?.created_at,
        )
      : null;
  const daysSinceLastEdition = latestEditionDate
    ? Math.floor((Date.now() - latestEditionDate.getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  let pubSeverity: RiskItem["severity"];
  let pubEvidence = latestEditionDate
    ? `Edisi terakhir ${daysSinceLastEdition} hari yang lalu.`
    : "Belum ada data tanggal edisi.";
  let pubRec = "";

  if (daysSinceLastEdition > 200 || editions.length === 0) {
    pubSeverity = "HIGH";
    pubRec =
      "Jadwal terbit tidak konsisten — ini langsung mempengaruhi indikator G (Jadwal Terbit). Pastikan 2 edisi terbit per tahun sesuai jadwal yang didaftarkan.";
  } else if (daysSinceLastEdition > 120) {
    pubSeverity = "MEDIUM";
    pubRec =
      "Edisi berikutnya mendekati jatuh tempo. Pastikan naskah sudah siap untuk mencegah keterlambatan.";
  } else {
    pubSeverity = "OK";
    pubRec = "Jadwal penerbitan terpantau normal. Pertahankan konsistensi ini.";
  }

  risks.push({
    id: "publication-delay",
    category: "Keterlambatan Publikasi",
    title: "Konsistensi Jadwal Terbit",
    description:
      "Memengaruhi indikator G7 (Jadwal Terbit, 1 poin) dan reputasi jurnal. Keterlambatan kronik bisa berdampak ke Desk Evaluation.",
    severity: pubSeverity,
    evidence: pubEvidence,
    recommendation: pubRec,
  });

  // ── 4. Status Desk Evaluation ──────────────────────────────────────
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
  const passedDesk = deskItems.filter(Boolean).length;
  const failedDesk = 8 - passedDesk;

  let deskSeverity: RiskItem["severity"] = "OK";
  if (failedDesk > 2) deskSeverity = "HIGH";
  else if (failedDesk > 0) deskSeverity = "MEDIUM";

  risks.push({
    id: "desk-evaluation",
    category: "Administratif",
    title: "Status Desk Evaluation",
    description:
      "Kegagalan desk evaluation menyebabkan jurnal gugur sebelum substansinya dinilai — ini batas keras yang tidak bisa dikompensasi oleh skor tinggi di tempat lain.",
    severity: deskSeverity,
    evidence: `${passedDesk}/8 syarat terpenuhi. ${failedDesk > 0 ? `${failedDesk} syarat belum selesai.` : "Semua syarat terpenuhi."}`,
    recommendation:
      failedDesk > 0
        ? "Prioritas tertinggi: selesaikan semua syarat desk evaluation sebelum mengerjakan perbaikan lain."
        : "Desk Evaluation bersih. Monitor secara berkala.",
  });

  // ── 5. Status Indeksasi ────────────────────────────────────────────
  risks.push({
    id: "indexing-status",
    category: "Indeksasi",
    title: "Status Indeksasi Internasional",
    description:
      "Lembaga Pengindeks (8B, max 8 poin) adalah salah satu pengungkit terbesar di kelompok H. Tidak terdaftar di Scopus/WoS membatasi skor maksimum ke 6/8.",
    severity: "MEDIUM",
    evidence:
      "Terindeks di DOAJ, Crossref, Google Scholar, Sinta, Garuda, IndexCopernicus, Dimensions, BASE (~6/8 poin). Belum terdaftar di Scopus atau WoS.",
    recommendation:
      "Daftarkan ke Scopus melalui jalur DOAJ → ESCI → Scopus. Proses membutuhkan 1–2 tahun. Mulai persiapan sekarang.",
  });

  return risks;
}

const SEVERITY_CONFIG = {
  HIGH: {
    label: "TINGGI",
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/20",
    icon: AlertCircle,
    barColor: "bg-destructive",
  },
  MEDIUM: {
    label: "SEDANG",
    color: "text-amber-600",
    bg: "bg-amber-500/10 border-amber-500/20",
    icon: AlertTriangle,
    barColor: "bg-amber-500",
  },
  LOW: {
    label: "RENDAH",
    color: "text-blue-600",
    bg: "bg-blue-500/10 border-blue-500/20",
    icon: Info,
    barColor: "bg-blue-500",
  },
  OK: {
    label: "AMAN",
    color: "text-emerald-600",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    icon: CheckCircle2,
    barColor: "bg-emerald-500",
  },
};

export default async function RiskDetectionPage() {
  await requireRole(["administrator", "journal_manager", "editor"]);
  const data = await getData();
  const risks = assessRisks(data);

  const highRisks = risks.filter((r) => r.severity === "HIGH");
  const medRisks = risks.filter((r) => r.severity === "MEDIUM");
  const okRisks = risks.filter((r) => r.severity === "OK");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deteksi Risiko AI</h1>
        <p className="text-muted-foreground mt-1">
          Radar lima kategori risiko lintas proses editorial. Terdeteksi lebih awal, diselesaikan
          sebelum menjadi krisis.
        </p>
      </div>

      {/* Compact High-Density Risk Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card border border-border/50 rounded-xl p-3.5 flex items-center gap-3">
          <div
            className={cn(
              "p-2.5 rounded-xl shrink-0",
              highRisks.length > 0
                ? "bg-destructive/10 text-destructive"
                : "bg-emerald-500/10 text-emerald-500",
            )}
          >
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Risiko Tinggi</p>
            <p
              className={cn(
                "text-2xl font-black mt-0.5",
                highRisks.length > 0 ? "text-destructive" : "text-emerald-500",
              )}
            >
              {highRisks.length}
            </p>
          </div>
        </div>

        <div className="glass-card border border-border/50 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Risiko Sedang</p>
            <p className="text-2xl font-black text-amber-600 mt-0.5">{medRisks.length}</p>
          </div>
        </div>

        <div className="glass-card border border-border/50 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Aman</p>
            <p className="text-2xl font-black text-emerald-500 mt-0.5">{okRisks.length}</p>
          </div>
        </div>

        <div className="glass-card border border-border/50 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Total Dipantau</p>
            <p className="text-2xl font-black text-foreground mt-0.5">{risks.length}</p>
          </div>
        </div>
      </div>

      {/* Radar visual */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" /> Risk Radar
          </CardTitle>
          <CardDescription>Status per kategori — diperbarui dari data real sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {risks.map((risk) => {
              const cfg = SEVERITY_CONFIG[risk.severity];
              const Icon = cfg.icon;
              return (
                <div
                  key={risk.id}
                  className={cn("rounded-xl border p-4 space-y-3 transition-all", cfg.bg)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4 shrink-0", cfg.color)} />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {risk.category}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-bold border rounded-full px-2 py-0.5",
                        cfg.bg,
                        cfg.color,
                      )}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{risk.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{risk.description}</p>
                  </div>
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-[11px] text-muted-foreground mb-1">
                      <strong>Temuan:</strong> {risk.evidence}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      <strong>Rekomendasi:</strong> {risk.recommendation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Alert className="border-border/40 bg-muted/10">
        <Shield className="h-4 w-4 text-muted-foreground" />
        <AlertTitle className="text-sm font-medium text-muted-foreground">
          Tentang Risk Detection
        </AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground mt-1">
          Penilaian risiko dihasilkan secara otomatis dari data yang tersedia di sistem JAMS saat
          ini. Semakin lengkap data yang dimasukkan, semakin akurat deteksi risikonya. Ini adalah
          estimasi AI — bukan audit resmi.
        </AlertDescription>
      </Alert>
    </div>
  );
}
