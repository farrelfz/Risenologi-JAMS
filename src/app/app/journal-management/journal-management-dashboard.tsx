"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Globe,
  Users,
  CheckCircle2,
  AlertCircle,
  Circle,
  Info,
  TrendingUp,
  Building2,
  Newspaper,
  Layout,
  Link2,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ManagementData {
  journal: any;
  reviewers: any[];
  editorialBoard: any[];
  editions: any[];
  articles: any[];
}

interface ManagementIndicator {
  code: string;
  name: string;
  score: number;
  maxScore: number;
  confidence: number; // 0–1
  detail: string;
  status: "pass" | "partial" | "fail" | "unknown";
}

interface ManagementCategory {
  code: string;
  name: string;
  maxScore: number;
  icon: React.ElementType;
  indicators: ManagementIndicator[];
}

function computeManagementData(data: ManagementData): ManagementCategory[] {
  const { journal, reviewers, editorialBoard, editions, articles } = data;

  // ── A: Penamaan Jurnal (2 poin) ──────────────────────────────────────
  const jurnalNama = journal?.nama || "";
  const isNamaSpesifik = jurnalNama.length > 0 && !jurnalNama.toLowerCase().includes("jurnal umum");
  // Risenologi = multidisiplin → kurang spesifik
  const namaScore = 1; // skor menengah (kurang spesifik, tapi ada nama)
  const namaConf = journal ? 0.9 : 0;

  // ── B: Kelembagaan Penerbit (5 poin) ──────────────────────────────────
  const hasPenerbit = Boolean(journal?.penerbit && journal.penerbit.trim().length > 0);
  // Diterbitkan OPI + PT/Litbang = 5, salah satu saja = 3, tidak = 1
  const penerbitScore = hasPenerbit ? 3 : 1; // asumsikan hanya satu institusi
  const penerbitConf = journal ? 0.8 : 0;

  // ── C: Manajemen Penyuntingan (19 poin) ──────────────────────────────
  // 3A Mitra Bestari (6): ≥4 negara + >50% internasional = 6, 2-3 negara = 4, lokal = 2
  const totalReviewers = reviewers.length;
  const intlReviewers = reviewers.filter(
    (r) => r.kualifikasi_internasional || r.qualification_level === "internasional",
  ).length;
  const reviewerCountries = Array.from(new Set(reviewers.map((r) => r.negara).filter(Boolean)));
  const intlRatio = totalReviewers > 0 ? intlReviewers / totalReviewers : 0;
  const mitraBestariScore =
    reviewerCountries.length >= 4 && intlRatio > 0.5 ? 6 : reviewerCountries.length >= 2 ? 4 : 2;
  const mitraBestariConf = totalReviewers > 0 ? 0.85 : 0.1;

  // 3B Dewan Penyunting (5): ≥4 negara + >50% intl = 5, 2-3 negara = 3, lokal = 1
  const edBoardCountries = Array.from(
    new Set(editorialBoard.map((e: any) => e.negara).filter(Boolean)),
  );
  const edBoardIntl = editorialBoard.filter(
    (e: any) => e.afiliasi_internasional || (e.negara && e.negara !== "Indonesia"),
  ).length;
  const edBoardRatio = editorialBoard.length > 0 ? edBoardIntl / editorialBoard.length : 0;
  const dewanScore =
    edBoardCountries.length >= 4 && edBoardRatio > 0.5 ? 5 : edBoardCountries.length >= 2 ? 3 : 1;
  const dewanConf = editorialBoard.length > 0 ? 0.8 : 0.15;

  // 3C Mutu Penyuntingan (3): belum ada data review_evidence, tandai unknown
  const mutuPenyuntinganScore = 0;
  const mutuConf = 0.05; // hampir tidak ada data

  // 3D Petunjuk Penulis (1): ada di website, asumsikan ada
  const petunjukScore = 0.5;
  const petunjukConf = 0.5;

  // 3E Mutu Gaya & Format (2): berdasarkan konsistensi edisi
  const mutuGayaScore = 1;
  const mutuGayaConf = 0.5;

  // 3F Manajemen Online (2): sistem OJS = online penuh
  const manajemenOnlineScore = 2;
  const manajemenOnlineConf = 0.9;

  const cTotal =
    mitraBestariScore +
    dewanScore +
    mutuPenyuntinganScore +
    petunjukScore +
    mutuGayaScore +
    manajemenOnlineScore;
  const cConf =
    (mitraBestariConf + dewanConf + mutuConf + petunjukConf + mutuGayaConf + manajemenOnlineConf) /
    6;

  // ── G: Penampilan & Keberkalaan (11 poin) ────────────────────────────
  // Data terbatas, estimasi berdasarkan keberadaan edisi
  const hasEditions = editions.length > 0;
  const edisiTepat = editions.length >= 2; // 2 terbitan/tahun
  const gScore = hasEditions ? 7 : 0; // estimasi kasar
  const gConf = hasEditions ? 0.4 : 0;

  // ── H: Penyebarluasan (12 poin) ──────────────────────────────────────
  // 8A Statistik Kunjungan (3): tidak ada data internal
  const statKunjunganScore = 0;
  const statConf = 0.05;

  // 8B Lembaga Pengindeks (8): Risenologi ada di DOAJ, Crossref, Google Scholar, Sinta, Garuda, IndexCopernicus = nasional+internasional
  const pengindeksScore = 6; // Internasional (bukan bereputasi tinggi Scopus/WoS)
  const pengindeksConf = 0.8;

  // 8C Identitas Unik/DOI (1): periksa artikel
  const articlesWithDoi = articles.filter((a) => a.doi && a.doi.trim().length > 0).length;
  const doiRatio = articles.length > 0 ? articlesWithDoi / articles.length : 0;
  const doiScore = doiRatio === 1 ? 1 : doiRatio > 0.5 ? 0.5 : 0;
  const doiConf = articles.length > 0 ? 0.9 : 0.1;

  const hTotal = statKunjunganScore + pengindeksScore + doiScore;
  const hConf = (statConf + pengindeksConf + doiConf) / 3;

  return [
    {
      code: "A",
      name: "Penamaan Jurnal",
      maxScore: 2,
      icon: Newspaper,
      indicators: [
        {
          code: "A1",
          name: "Nama Jurnal",
          score: namaScore,
          maxScore: 2,
          confidence: namaConf,
          detail: jurnalNama
            ? `Jurnal: "${jurnalNama}" — multidisiplin, skor menengah (kurang spesifik)`
            : "Nama jurnal belum terisi di sistem",
          status: namaScore >= 2 ? "pass" : namaScore >= 1 ? "partial" : "fail",
        },
      ],
    },
    {
      code: "B",
      name: "Kelembagaan Penerbit",
      maxScore: 5,
      icon: Building2,
      indicators: [
        {
          code: "B1",
          name: "Lembaga Penerbit",
          score: penerbitScore,
          maxScore: 5,
          confidence: penerbitConf,
          detail: hasPenerbit
            ? `Penerbit: ${journal.penerbit} — dinilai sebagai satu institusi (3/5). Kerja sama OPI+PT/Litbang bisa naik ke 5/5.`
            : "Kelembagaan penerbit belum diisi. Lengkapi di Pengaturan Jurnal.",
          status: hasPenerbit ? "partial" : "fail",
        },
      ],
    },
    {
      code: "C",
      name: "Manajemen Penyuntingan",
      maxScore: 19,
      icon: Users,
      indicators: [
        {
          code: "3A",
          name: "Mitra Bestari",
          score: mitraBestariScore,
          maxScore: 6,
          confidence: mitraBestariConf,
          detail:
            totalReviewers > 0
              ? `${totalReviewers} reviewer, ${reviewerCountries.length} negara (${(intlRatio * 100).toFixed(0)}% internasional). Target: ≥4 negara + >50% internasional.`
              : "Belum ada data reviewer.",
          status: mitraBestariScore === 6 ? "pass" : mitraBestariScore >= 4 ? "partial" : "fail",
        },
        {
          code: "3B",
          name: "Dewan Penyunting",
          score: dewanScore,
          maxScore: 5,
          confidence: dewanConf,
          detail:
            editorialBoard.length > 0
              ? `${editorialBoard.length} anggota, ${edBoardCountries.length} negara. Target: ≥4 negara + >50% internasional.`
              : "Belum ada data dewan penyunting.",
          status: dewanScore === 5 ? "pass" : dewanScore >= 3 ? "partial" : "fail",
        },
        {
          code: "3C",
          name: "Mutu Penyuntingan Substantif",
          score: mutuPenyuntinganScore,
          maxScore: 3,
          confidence: mutuConf,
          detail: "Belum ada bukti telaah tersimpan di sistem.",
          status: "unknown",
        },
        {
          code: "3D",
          name: "Petunjuk Penulis",
          score: petunjukScore,
          maxScore: 1,
          confidence: petunjukConf,
          detail: "Ada di website OJS. Verifikasi kelengkapan template & contoh manual.",
          status: "partial",
        },
        {
          code: "3E",
          name: "Mutu Gaya & Format",
          score: mutuGayaScore,
          maxScore: 2,
          confidence: mutuGayaConf,
          detail: "Belum ada cek otomatis tipografi/tata letak. Estimasi berdasarkan asumsi.",
          status: "partial",
        },
        {
          code: "3F",
          name: "Manajemen Online (OJS)",
          score: manajemenOnlineScore,
          maxScore: 2,
          confidence: manajemenOnlineConf,
          detail: "Risenologi menggunakan OJS 3.3.0.19 — sepenuhnya daring. Skor penuh.",
          status: "pass",
        },
      ],
    },
    {
      code: "G",
      name: "Penampilan & Keberkalaan",
      maxScore: 11,
      icon: Layout,
      indicators: [
        {
          code: "G",
          name: "Penampilan & Keberkalaan (Gabungan)",
          score: gScore,
          maxScore: 11,
          confidence: gConf,
          detail: hasEditions
            ? `${editions.length} edisi terdata. Pengecekan tipografi/tata letak siap dilakukan.`
            : "Belum ada data edisi.",
          status: "partial",
        },
      ],
    },
    {
      code: "H",
      name: "Penyebarluasan",
      maxScore: 12,
      icon: Globe,
      indicators: [
        {
          code: "8A",
          name: "Statistik Kunjungan",
          score: statKunjunganScore,
          maxScore: 3,
          confidence: statConf,
          detail:
            "Belum ada integrasi Google Analytics / StatCounter. Data kunjungan tidak tersedia di sistem.",
          status: "unknown",
        },
        {
          code: "8B",
          name: "Lembaga Pengindeks",
          score: pengindeksScore,
          maxScore: 8,
          confidence: pengindeksConf,
          detail:
            "Terindeks: DOAJ, Crossref, Google Scholar, Sinta, Garuda, IndexCopernicus, Dimensions, BASE. Belum Scopus/WoS (skor max 8).",
          status: "partial",
        },
        {
          code: "8C",
          name: "Identitas Unik Artikel (DOI)",
          score: doiScore,
          maxScore: 1,
          confidence: doiConf,
          detail:
            articles.length > 0
              ? `${articlesWithDoi}/${articles.length} artikel memiliki DOI (${(doiRatio * 100).toFixed(0)}%). Target: 100%.`
              : "Belum ada data artikel.",
          status: doiScore === 1 ? "pass" : doiScore > 0 ? "partial" : "fail",
        },
      ],
    },
  ];
}

function ProgressBar({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const color =
    pct >= 80
      ? "from-emerald-600 to-emerald-400"
      : pct >= 50
        ? "from-amber-600 to-amber-400"
        : "from-red-600 to-red-400";
  return (
    <div className={cn("h-2 w-full bg-muted/50 rounded-full overflow-hidden", className)}>
      <div
        className={cn(
          "h-full bg-gradient-to-r rounded-full transition-all duration-700 ease-out",
          color,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StatusIcon({ status }: { status: ManagementIndicator["status"] }) {
  if (status === "pass") return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
  if (status === "partial") return <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />;
  if (status === "fail") return <AlertCircle className="h-4 w-4 text-destructive shrink-0" />;
  return <Circle className="h-4 w-4 text-muted-foreground shrink-0" />;
}

function ConfidenceBadge({ conf }: { conf: number }) {
  const pct = Math.round(conf * 100);
  const cls =
    pct >= 70
      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      : pct >= 40
        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
        : "bg-slate-500/10 text-slate-500 border-slate-500/20";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        cls,
      )}
    >
      <Info className="h-2.5 w-2.5" /> {pct}% yakin
    </span>
  );
}

function CategoryCard({ cat }: { cat: ManagementCategory }) {
  const [open, setOpen] = useState(false);
  const totalScore = cat.indicators.reduce((s, i) => s + i.score, 0);
  const pct = Math.round((totalScore / cat.maxScore) * 100);
  const avgConf = cat.indicators.reduce((s, i) => s + i.confidence, 0) / cat.indicators.length;

  return (
    <Card className="glass-card border-border/50 overflow-hidden">
      <button className="w-full text-left" onClick={() => setOpen((o) => !o)}>
        <CardHeader className="p-5 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <cat.icon className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-foreground leading-tight">
                  Kelompok {cat.code} — {cat.name}
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Maks {cat.maxScore} poin
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-lg font-bold text-foreground">
                  {totalScore.toFixed(1)}
                  <span className="text-xs text-muted-foreground font-normal">/{cat.maxScore}</span>
                </div>
                <div className="text-xs text-muted-foreground">{pct}%</div>
              </div>
              {open ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
          <ProgressBar value={totalScore} max={cat.maxScore} className="mt-3" />
          <div className="flex items-center justify-between mt-2">
            <ConfidenceBadge conf={avgConf} />
            <span className="text-[10px] text-muted-foreground">
              {cat.indicators.length} indikator
            </span>
          </div>
        </CardHeader>
      </button>

      {open && (
        <CardContent className="px-5 pb-5 pt-0 space-y-3 border-t border-border/30">
          {cat.indicators.map((ind) => (
            <div
              key={ind.code}
              className="rounded-lg bg-muted/20 border border-border/40 p-3.5 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <StatusIcon status={ind.status} />
                  <div>
                    <p className="text-sm font-medium text-foreground leading-tight">
                      {ind.code}. {ind.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {ind.detail}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-bold text-foreground">
                    {ind.score.toFixed(1)}
                    <span className="text-xs text-muted-foreground font-normal">
                      /{ind.maxScore}
                    </span>
                  </div>
                  <ConfidenceBadge conf={ind.confidence} />
                </div>
              </div>
              <ProgressBar value={ind.score} max={ind.maxScore} />
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}

export function JournalManagementDashboard({ data }: { data: ManagementData }) {
  const categories = computeManagementData(data);
  const totalScore = categories.reduce(
    (s, c) => s + c.indicators.reduce((ss, i) => ss + i.score, 0),
    0,
  );
  const totalMax = 49;
  const overallPct = Math.round((totalScore / totalMax) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tata Kelola Jurnal</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground text-sm">
              Progress per kategori Management (49 poin): A, B, C, G, H
            </p>
            <Link
              href="/app/rubric-reference"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 px-2 py-0.5 rounded-md transition-colors"
            >
              <BookOpen className="h-3 w-3" /> Panduan & Kamus Rubrik
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-3xl font-black text-foreground">
            {totalScore.toFixed(1)}
            <span className="text-lg text-muted-foreground font-normal"> / {totalMax}</span>
          </div>
          <span className="text-sm text-muted-foreground">{overallPct}% terpenuhi</span>
        </div>
      </div>

      {/* Overall progress */}
      <Card className="glass-card border-border/50">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3 text-sm">
            <span className="font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Total Management (maks 49 poin)
            </span>
            <span className="font-bold text-foreground">{totalScore.toFixed(1)} / 49</span>
          </div>
          <ProgressBar value={totalScore} max={49} />
          <div className="mt-3 grid grid-cols-5 gap-2 text-center text-xs text-muted-foreground">
            {categories.map((cat) => {
              const catScore = cat.indicators.reduce((s, i) => s + i.score, 0);
              return (
                <div key={cat.code} className="space-y-1">
                  <div className="font-semibold text-foreground text-sm">
                    {catScore.toFixed(0)}/{cat.maxScore}
                  </div>
                  <div>Kel. {cat.code}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Per-category cards */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <CategoryCard key={cat.code} cat={cat} />
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-muted-foreground mt-4 px-4">
        * Estimasi AI Auditor berbasis data sistem saat ini — bukan skor akreditasi resmi
        Arjuna/Kemdiktisaintek. Instrumen Periode II 2025. Confidence rendah pada indikator dengan
        tanda ⓘ berarti data belum cukup untuk estimasi akurat.
      </p>
    </div>
  );
}
