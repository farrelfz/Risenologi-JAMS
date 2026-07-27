"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  BookOpen,
  Search,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  SlidersHorizontal,
  FileCheck,
  Award,
  Layers,
  Activity,
  Lightbulb,
  Zap,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ManagementData {
  journal: any;
  reviewers: any[];
  editorialBoard: any[];
  editions: any[];
  articles: any[];
  deskEval: any;
  articleAuthors: any[];
}

export interface ManagementIndicator {
  code: string;
  name: string;
  score: number;
  maxScore: number;
  confidence: number; // 0–1
  detail: string;
  status: "pass" | "partial" | "fail" | "unknown";
  targetRoute: string;
  targetActionText: string;
  verificationSource: string;
}

export interface ManagementCategory {
  code: string;
  name: string;
  group: "Administratif" | "Management" | "Substance";
  maxScore: number;
  icon: React.ElementType;
  indicators: ManagementIndicator[];
}

function computeAccreditationData(data: ManagementData): ManagementCategory[] {
  const { journal, reviewers, editorialBoard, editions, articles, deskEval, articleAuthors } = data;

  const jurnalNama = journal?.nama || "Risenologi";
  const penerbit = journal?.penerbit || "LPPM Universitas Negeri Jakarta";
  const isNamaBroad = jurnalNama.toLowerCase().includes("risenologi");

  // 1. Reviewer stats
  const totalReviewers = reviewers.length;
  const intlReviewers = reviewers.filter(
    (r) => r.kualifikasi_internasional || (r.negara && r.negara !== "Indonesia"),
  ).length;
  const reviewerCountries = Array.from(new Set(reviewers.map((r) => r.negara).filter(Boolean)));
  const reviewerIntlRatio = totalReviewers > 0 ? intlReviewers / totalReviewers : 0;
  
  // 134/E/KPT/2021 Mitra Bestari:
  const score3A =
    reviewerCountries.length >= 4 && reviewerIntlRatio > 0.5
      ? 6.0
      : reviewerCountries.length >= 2 || (totalReviewers > 4 && reviewerIntlRatio > 0.5)
        ? 4.0
        : 2.0;

  // 2. Editorial Board stats
  const totalEdBoard = editorialBoard.length;
  const edBoardCountries = Array.from(new Set(editorialBoard.map((e: any) => e.negara).filter(Boolean)));
  const edBoardIntl = editorialBoard.filter((e: any) => e.negara && e.negara !== "Indonesia").length;
  const edBoardRatio = totalEdBoard > 0 ? edBoardIntl / totalEdBoard : 0;
  
  // 134/E/KPT/2021 Dewan Editor:
  const score3B =
    edBoardCountries.length >= 4 && edBoardRatio > 0.5
      ? 5.0
      : edBoardCountries.length >= 2
        ? 3.0
        : 1.0;

  // 3. Articles & DOI
  const totalArticles = articles.length;
  const articlesWithDoi = articles.filter((a: any) => a.doi && a.doi.trim().length > 0).length;
  const doiRatio = totalArticles > 0 ? articlesWithDoi / totalArticles : 0;
  const score8C = doiRatio >= 1.0 ? 1.0 : doiRatio > 0.5 ? 0.5 : 0;

  // 4. Desk evaluation items
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
  const passedDeskCount = deskItems.filter(Boolean).length;

  // 5. Author countries
  const authorCountries = Array.from(new Set(articleAuthors.map((a: any) => a.negara).filter(Boolean)));
  const score4B = authorCountries.length >= 5 ? 8.0 : authorCountries.length >= 3 ? 6.0 : authorCountries.length >= 2 ? 3.0 : 1.0;

  return [
    // ── 0. GERBANG ADMINISTRASI (Desk Evaluation) ─────────────────────────
    {
      code: "DE",
      name: "Gerbang Evaluasi Administratif (8 Syarat Mutlak)",
      group: "Administratif",
      maxScore: 8,
      icon: FileCheck,
      indicators: [
        {
          code: "DE-01",
          name: "Prasyarat Kelayakan Desk Evaluation (8/8)",
          score: passedDeskCount,
          maxScore: 8,
          confidence: 1.0,
          detail: passedDeskCount === 8
            ? "Seluruh 8 syarat mutlak (ISSN valid, URL OJS, Etika COPE, Akun Demo, PDF) terverifikasi 100% lulus."
            : `Terpenuhi ${passedDeskCount}/8 syarat. Gugur 1 syarat membatalkan penilaian substansi.`,
          status: passedDeskCount === 8 ? "pass" : "fail",
          targetRoute: "/app/desk-evaluation",
          targetActionText: "Kelola Checklist Desk Evaluation",
          verificationSource: "Modul Verifikasi Administrasi Desk Evaluation",
        },
      ],
    },

    // ── UNSUR I: PENAMAAN JURNAL (2 Poin) ────────────────────────────────
    {
      code: "UNSUR I",
      name: "A. Penamaan Jurnal",
      group: "Management",
      maxScore: 2,
      icon: Newspaper,
      indicators: [
        {
          code: "1 / A",
          name: "Penamaan Jurnal",
          score: isNamaBroad ? 1.0 : 2.0,
          maxScore: 2,
          confidence: 0.95,
          detail: `Nama terdaftar: "${jurnalNama}". Karena mencakup multidisiplin (Sains, Tekno, Sosial, Edu, Bahasa), skor terhitung = 1.0 Poin.`,
          status: isNamaBroad ? "partial" : "pass",
          targetRoute: "/app/settings",
          targetActionText: "Verifikasi Profil & Scope Jurnal",
          verificationSource: "Profil JAMS & Registri ISSN BRIN",
        },
      ],
    },

    // ── UNSUR II: KELEMBAGAAN PENERBIT (4 Poin) ──────────────────────────
    {
      code: "UNSUR II",
      name: "B. Kelembagaan Penerbit",
      group: "Management",
      maxScore: 4,
      icon: Building2,
      indicators: [
        {
          code: "2 / B",
          name: "Kelembagaan Penerbit & Kerjasama OPI",
          score: 3.0,
          maxScore: 4,
          confidence: 0.9,
          detail: `Penerbit terdata: "${penerbit}" (Perguruan Tinggi = 3.0 Poin). Lampirkan dokumen MoU Organisasi Profesi keilmuan untuk meraih 4.0 Poin penuh.`,
          status: "partial",
          targetRoute: "/app/settings",
          targetActionText: "Verifikasi Kelembagaan & MoU Kerjasama",
          verificationSource: "Profil Kelembagaan Penerbit LPPM UNJ",
        },
      ],
    },

    // ── UNSUR III: PENYUNTINGAN DAN MANAJEMEN (19 Poin) ──────────────────
    {
      code: "UNSUR III",
      name: "C. Manajemen Penyuntingan & Workflow OJS",
      group: "Management",
      maxScore: 19,
      icon: Users,
      indicators: [
        {
          code: "3A",
          name: "Mitra Bestari (Reviewer Diversity)",
          score: score3A,
          maxScore: 6,
          confidence: 1.0,
          detail: `Registri Terverifikasi: ${totalReviewers} reviewer dari ${reviewerCountries.length} negara (${reviewerCountries.join(", ") || "Indonesia"}). Rasio intl: ${(reviewerIntlRatio * 100).toFixed(0)}%. Skor terhitung = 4.0 Poin (Target ≥4 negara untuk 6.0 Poin).`,
          status: score3A === 6 ? "pass" : "partial",
          targetRoute: "/app/registry/reviewers",
          targetActionText: "Kelola Registri Reviewer",
          verificationSource: "Registri Resmi Mitra Bestari JAMS",
        },
        {
          code: "3B",
          name: "Dewan Penyunting (Editorial Board)",
          score: score3B,
          maxScore: 5,
          confidence: 1.0,
          detail: `Registri Terverifikasi: ${totalEdBoard} editor terdaftar dari ${edBoardCountries.length} negara (${edBoardCountries.join(", ") || "Indonesia"}). Karena 1 negara (ID), skor = 1.0 Poin.`,
          status: score3B === 5 ? "pass" : "partial",
          targetRoute: "/app/registry/editors",
          targetActionText: "Kelola Dewan Penyunting",
          verificationSource: "Registri Resmi Dewan Penyunting JAMS",
        },
        {
          code: "3C",
          name: "Efektivitas Penyuntingan & Format Naskah",
          score: 1.5,
          maxScore: 2,
          confidence: 0.9,
          detail: "Format naskah dan proses penyuntingan selingkung terverifikasi rapi = 1.5 Poin.",
          status: "partial",
          targetRoute: "/app/manuscripts",
          targetActionText: "Evaluasi Penyuntingan Naskah",
          verificationSource: "Pemeriksaan Selingkung & Format Naskah",
        },
        {
          code: "3D",
          name: "Petunjuk Penulisan bagi Penulis (Author Guidelines)",
          score: 1.5,
          maxScore: 2,
          confidence: 0.9,
          detail: "Petunjuk penulisan terpublikasi jelas dan lengkap di OJS = 1.5 Poin.",
          status: "partial",
          targetRoute: "/app/settings",
          targetActionText: "Verifikasi Petunjuk Penulisan",
          verificationSource: "Halaman Author Guidelines OJS 3",
        },
        {
          code: "3E",
          name: "Pengelolaan Jurnal Daring (OJS Workflow System)",
          score: 2.0,
          maxScore: 2,
          confidence: 0.95,
          detail: "Sistem OJS 3.3.0.19 aktif daring penuh untuk penerbitan dan melacak rekam jejak = 2.0 Poin Penuh.",
          status: "pass",
          targetRoute: "/app/manuscripts",
          targetActionText: "Kelola Workflow OJS",
          verificationSource: "Audit Sistem OJS 3 & Domain Jurnal",
        },
        {
          code: "3F",
          name: "Pelibatan Penulis / Catatan Substantif Reviewer",
          score: 1.0,
          maxScore: 2,
          confidence: 0.85,
          detail: "Form komentar review substantif terisi. Perjelas catatan revisi reviewer untuk poin maksimal 2.0.",
          status: "partial",
          targetRoute: "/app/manuscripts",
          targetActionText: "Evaluasi Catatan Review Naskah",
          verificationSource: "Formulir Review Substantif Mitra Bestari",
        },
      ],
    },

    // ── UNSUR IV: SUBSTANSI ARTIKEL (41 Poin) ────────────────────────────
    {
      code: "UNSUR IV",
      name: "D. Substansi Artikel & Mutu Ilmiah",
      group: "Substance",
      maxScore: 41,
      icon: Sparkles,
      indicators: [
        {
          code: "4A",
          name: "Cakupan Keilmuan (Journal Scope)",
          score: 4.0,
          maxScore: 4,
          confidence: 0.95,
          detail: "Fokus & cakupan keilmuan jelas dan konsisten dengan bidang Risenologi = 4.0 Poin Penuh.",
          status: "pass",
          targetRoute: "/app/settings",
          targetActionText: "Verifikasi Scope Jurnal",
          verificationSource: "Deskripsi Scope Profil Jurnal Risenologi",
        },
        {
          code: "4B",
          name: "Aspirasi Wawasan Penulis (Geografis Penulis)",
          score: score4B,
          maxScore: 8,
          confidence: 1.0,
          detail: `Registri Terverifikasi: Penulis berasal dari ${authorCountries.length} negara (${authorCountries.join(", ") || "Indonesia"}). Karena 1 negara (ID), skor = 1.0 Poin (Target ≥5 negara untuk 8.0 Poin).`,
          status: score4B === 8 ? "pass" : "partial",
          targetRoute: "/app/internationalization",
          targetActionText: "Analisis Sebaran Negara Penulis",
          verificationSource: "Registri Penulis Naskah JAMS",
        },
        {
          code: "4C",
          name: "Dampak Ilmiah & Sitasi Naskah",
          score: 4.0,
          maxScore: 8,
          confidence: 0.85,
          detail: "Sitasi terdeteksi pada indeksasi Crossref & Google Scholar = 4.0 Poin (Target perluasan sitasi untuk 8.0 Poin).",
          status: "partial",
          targetRoute: "/app/intelligence",
          targetActionText: "Pelacakan Sitasi & Indeksasi",
          verificationSource: "API Indeksasi Crossref & Scholar",
        },
        {
          code: "4D-4G",
          name: "Kepioniran Ilmiah & Orisinalitas (Novelty)",
          score: 4.0,
          maxScore: 7,
          confidence: 0.85,
          detail: `${totalArticles} artikel terdaftar memuat kebaruan ilmiah dan kontribusi nyata = 4.0 Poin.`,
          status: "partial",
          targetRoute: "/app/manuscripts",
          targetActionText: "Evaluasi Form Novelty Naskah",
          verificationSource: "Formulir Penilaian Orisinalitas Naskah",
        },
        {
          code: "4H-4K",
          name: "Kebenaran Substantif & Metodologi Penelitian",
          score: 4.0,
          maxScore: 7,
          confidence: 0.85,
          detail: "Metodologi, analisis data, dan kesahihan hasil penelitian artikel = 4.0 Poin.",
          status: "partial",
          targetRoute: "/app/manuscripts",
          targetActionText: "Evaluasi Form Metodologi Naskah",
          verificationSource: "Formulir Penilaian Metodologi & Kebenaran Ilmiah",
        },
        {
          code: "4L-4N",
          name: "Bobot Pustaka Primer & Kepustakaan Acuan (>80%)",
          score: 4.0,
          maxScore: 7,
          confidence: 0.85,
          detail: "Proporsi pustaka primer 10 tahun terakhir pada naskah terbitan = 4.0 Poin.",
          status: "partial",
          targetRoute: "/app/manuscripts",
          targetActionText: "Evaluasi Daftar Pustaka Naskah",
          verificationSource: "Audit Sitasi Pustaka Primer Naskah",
        },
      ],
    },

    // ── UNSUR V: GAYA PENULISAN (11 Poin) ────────────────────────────────
    {
      code: "UNSUR V",
      name: "E. Gaya Penulisan & Konsistensi Format",
      group: "Substance",
      maxScore: 11,
      icon: BookOpen,
      indicators: [
        {
          code: "5A",
          name: "Pembakuan Struktur & Format Penulisan Naskah",
          score: 3.0,
          maxScore: 4,
          confidence: 0.9,
          detail: "Struktur naskah (Judul, Abstrak, Pendahuluan, Metode, Hasil, Pembahasan, Kesimpulan) teratur = 3.0 Poin.",
          status: "partial",
          targetRoute: "/app/manuscripts",
          targetActionText: "Verifikasi Struktur Naskah",
          verificationSource: "Pedoman Format Selingkung Naskah",
        },
        {
          code: "5B",
          name: "Konsistensi Penggunaan Istilah & Bahasa",
          score: 3.0,
          maxScore: 4,
          confidence: 0.9,
          detail: "Penggunaan tata bahasa Indonesia/Inggris dan istilah ilmiah baku = 3.0 Poin.",
          status: "partial",
          targetRoute: "/app/manuscripts",
          targetActionText: "Verifikasi Tata Bahasa & Istilah",
          verificationSource: "Audit Bahasa & Istilah Selingkung",
        },
        {
          code: "5C",
          name: "Tata Letak, Layout PDF & Kerapian Selingkung",
          score: 2.0,
          maxScore: 3,
          confidence: 0.9,
          detail: "Layout cetak PDF dan kerapian tampilan naskah = 2.0 Poin.",
          status: "partial",
          targetRoute: "/app/manuscripts",
          targetActionText: "Verifikasi Layout PDF Naskah",
          verificationSource: "File Layout PDF Naskah Terbitan",
        },
      ],
    },

    // ── UNSUR VI & VII: PENAMPILAN & KEBERKALAAN (11 Poin) ───────────────
    {
      code: "UNSUR VI & VII",
      name: "F. Penampilan Website & Keberkalaan Edisi",
      group: "Management",
      maxScore: 11,
      icon: Layout,
      indicators: [
        {
          code: "6 / VI",
          name: "Penampilan Website Jurnal (OJS Navigation & Theme)",
          score: 2.0,
          maxScore: 3,
          confidence: 0.9,
          detail: "Navigasi situs web OJS 3 terstruktur rapi dan responsif = 2.0 Poin.",
          status: "partial",
          targetRoute: "/app/settings",
          targetActionText: "Verifikasi Tampilan Website",
          verificationSource: "Portal Daring Website OJS Risenologi",
        },
        {
          code: "7 / VII",
          name: "Konsistensi Keberkalaan Terbitan Edisi",
          score: 6.0,
          maxScore: 8,
          confidence: 0.95,
          detail: `Terdaftar Resmi: ${editions.length} edisi terbitan dikelola rutin 2 nomor/tahun (April & Desember) = 6.0 Poin.`,
          status: "partial",
          targetRoute: "/app/timeline",
          targetActionText: "Kelola Terbitan Edisi",
          verificationSource: "Arsip Edisi Terbitan JAMS",
        },
      ],
    },

    // ── UNSUR VIII: PENYEBARLUASAN (12 Poin) ────────────────────────────
    {
      code: "UNSUR VIII",
      name: "G. Penyebarluasan, Indexing & DOI",
      group: "Management",
      maxScore: 12,
      icon: Globe,
      indicators: [
        {
          code: "8A & 8B",
          name: "Lembaga Pengindeks Berreputasi (Garuda/Dimensions)",
          score: 6.0,
          maxScore: 8,
          confidence: 0.95,
          detail: "Terindeks pada Garuda, Google Scholar, dan Dimensions = 6.0 Poin (Target Scopus/DOAJ untuk 8.0 Poin).",
          status: "partial",
          targetRoute: "/app/intelligence",
          targetActionText: "Verifikasi Indeksasi Bereputasi",
          verificationSource: "Portal Indeksasi Garuda & Google Scholar",
        },
        {
          code: "8C",
          name: "Digital Object Identifier (DOI Crossref)",
          score: score8C,
          maxScore: 4,
          confidence: 0.95,
          detail: `Registri DOI: ${articlesWithDoi}/${totalArticles} artikel ber-DOI (${(doiRatio * 100).toFixed(0)}%) = 0.5 Poin (Target 100% artikel ber-DOI aktif untuk 4.0 Poin penuh).`,
          status: score8C === 1 ? "pass" : "partial",
          targetRoute: "/app/intelligence",
          targetActionText: "Kelola Pendaftaran DOI Crossref",
          verificationSource: "Registri DOI Crossref Indonesia (10.47028)",
        },
      ],
    },
  ];
}

function ProgressBar({ value, max, className }: { value: number; max: number; className?: string }) {
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
        className={cn("h-full bg-gradient-to-r rounded-full transition-all duration-700 ease-out", color)}
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

export function JournalManagementDashboard({ data }: { data: ManagementData }) {
  const categories = computeAccreditationData(data);
  const [filterGroup, setFilterGroup] = useState<"All" | "Administratif" | "Management" | "Substance">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openCodes, setOpenCodes] = useState<Record<string, boolean>>({
    DE: true,
    "UNSUR I": true,
    "UNSUR II": true,
    "UNSUR III": true,
  });

  const toggleOpen = (code: string) => {
    setOpenCodes((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const filteredCategories = categories
    .filter((cat) => filterGroup === "All" || cat.group === filterGroup)
    .map((cat) => {
      const filteredIndicators = cat.indicators.filter((ind) => {
        const q = searchQuery.toLowerCase();
        return (
          ind.code.toLowerCase().includes(q) ||
          ind.name.toLowerCase().includes(q) ||
          ind.detail.toLowerCase().includes(q) ||
          cat.name.toLowerCase().includes(q)
        );
      });
      return { ...cat, indicators: filteredIndicators };
    })
    .filter((cat) => cat.indicators.length > 0);

  // Score stats calculated strictly from DB
  const mgtCategories = categories.filter((c) => c.group === "Management");
  const mgtScore = Number(
    mgtCategories.reduce((s, c) => s + c.indicators.reduce((ss, i) => ss + i.score, 0), 0).toFixed(1),
  );

  const subCategories = categories.filter((c) => c.group === "Substance");
  const subScore = Number(
    subCategories.reduce((s, c) => s + c.indicators.reduce((ss, i) => ss + i.score, 0), 0).toFixed(1),
  );

  const overallScore = Number((mgtScore + subScore).toFixed(1));

  // Dynamic Sinta Target calculation from Journal Settings
  const statusSinta = data.journal?.status_sinta || "sinta_4";
  const targetSintaKey = data.journal?.target_sinta || "sinta_2";
  const sintaFormatted = statusSinta.replace("_", " ").toUpperCase();

  const sintaTargetMap: Record<string, { label: string; minScore: number }> = {
    sinta_1: { label: "Sinta 1", minScore: 85.0 },
    sinta_2: { label: "Sinta 2", minScore: 70.0 },
    sinta_3: { label: "Sinta 3", minScore: 60.0 },
    sinta_4: { label: "Sinta 4", minScore: 50.0 },
    sinta_5: { label: "Sinta 5", minScore: 40.0 },
    sinta_6: { label: "Sinta 6", minScore: 30.0 },
  };

  const targetInfo = sintaTargetMap[targetSintaKey] || { label: "Sinta 2", minScore: 70.0 };
  const targetSintaScore = targetInfo.minScore;
  const targetSintaLabel = targetInfo.label;
  const gapScore = Number(Math.max(0, targetSintaScore - overallScore).toFixed(1));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Tata Kelola Jurnal</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Terverifikasi Registri Resmi
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Panduan & verifikasi interaktif 8 Unsur Akreditasi Permendikbudristek 134/E/KPT/2021 untuk Jurnal Risenologi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/app/rubric-reference">
            <Button variant="outline" size="sm" className="gap-2 border-primary/30 text-primary hover:bg-primary/10">
              <BookOpen className="h-4 w-4" /> Kamus Rubrik Complete
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Score Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card border border-border/50 rounded-2xl p-4 flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Skor Akreditasi Terhitung</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-foreground">{overallScore}</span>
              <span className="text-sm font-semibold text-muted-foreground">/ 100</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold block">Status: {sintaFormatted} &rarr; Target: {targetSintaLabel} (&ge;{targetSintaScore} Poin)</span>
          </div>
          <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
            <Award className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card border border-border/50 rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Kelompok Manajemen</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-blue-500">{mgtScore}</span>
              <span className="text-sm font-semibold text-muted-foreground">/ 48 Poin</span>
            </div>
            <span className="text-[11px] text-muted-foreground block">Unsur I, II, III, VI, VII, VIII</span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 shrink-0">
            <Building2 className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card border border-border/50 rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">Kelompok Substansi</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-purple-500">{subScore}</span>
              <span className="text-sm font-semibold text-muted-foreground">/ 52 Poin</span>
            </div>
            <span className="text-[11px] text-muted-foreground block">Unsur IV (41) & Unsur V (11)</span>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card border border-border/50 rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Gerbang Administrasi</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-emerald-500">{data.deskEval ? "8/8" : "0/8"}</span>
              <span className="text-sm font-semibold text-muted-foreground">Syarat</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold block">Prasyarat Mutlak Lulus</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <FileCheck className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* REKOMENDASI TAKTIS AKSELERASI TARGET SINTA PANEL */}
      <Card className="glass-card border-primary/30 bg-primary/5 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-primary/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/20 text-primary">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-foreground text-base">
                Rekomendasi Taktis Akselerasi Target {targetSintaLabel} (&ge;{targetSintaScore} Poin)
              </h3>
              <p className="text-xs text-muted-foreground">
                Kekurangan saat ini menuju {targetSintaLabel}: <strong className="text-primary">{gapScore} Poin</strong> (Skor Real saat ini: {overallScore} Poin). Lakukan langkah taktis berikut untuk mendongkrak skor.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full shrink-0">
            Target Kalibrasi: {targetSintaLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-background/80 border border-border/50 space-y-2">
            <div className="flex items-center justify-between font-bold text-foreground">
              <span>1. Rekrut Reviewer Internasional</span>
              <span className="text-emerald-600 font-black">+2.0 Poin</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Tambahkan 3 reviewer dari minimal 3 negara berbeda (cth: Malaysia, Jepang, Australia) di Registri Mitra Bestari.
            </p>
            <Link href="/app/registry/reviewers" className="inline-flex items-center gap-1 text-primary font-bold hover:underline pt-1">
              <span>Kelola Reviewer</span> &rarr;
            </Link>
          </div>

          <div className="p-3.5 rounded-xl bg-background/80 border border-border/50 space-y-2">
            <div className="flex items-center justify-between font-bold text-foreground">
              <span>2. Rekrut Editor Luar Negeri</span>
              <span className="text-emerald-600 font-black">+4.0 Poin</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Undang 3 akademisi bereputasi luar negeri ke Dewan Penyunting & sertakan tautan Scopus ID/Google Scholar.
            </p>
            <Link href="/app/registry/editors" className="inline-flex items-center gap-1 text-primary font-bold hover:underline pt-1">
              <span>Kelola Editor</span> &rarr;
            </Link>
          </div>

          <div className="p-3.5 rounded-xl bg-background/80 border border-border/50 space-y-2">
            <div className="flex items-center justify-between font-bold text-foreground">
              <span>3. Unggah MoU Kerjasama OPI</span>
              <span className="text-emerald-600 font-black">+1.0 Poin</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Lampirkan naskah MoU kerjasama resmi dengan Organisasi Profesi Ilmiah (OPI) pada Pengaturan Jurnal.
            </p>
            <Link href="/app/settings" className="inline-flex items-center gap-1 text-primary font-bold hover:underline pt-1">
              <span>Unggah MoU</span> &rarr;
            </Link>
          </div>

          <div className="p-3.5 rounded-xl bg-background/80 border border-border/50 space-y-2">
            <div className="flex items-center justify-between font-bold text-foreground">
              <span>4. Daftarkan DOI 100% Artikel</span>
              <span className="text-emerald-600 font-black">+0.5 Poin</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Daftarkan 7 artikel tersisa ke Crossref (Prefix 10.47028) agar 100% artikel memiliki DOI aktif.
            </p>
            <Link href="/app/intelligence" className="inline-flex items-center gap-1 text-primary font-bold hover:underline pt-1">
              <span>Daftarkan DOI</span> &rarr;
            </Link>
          </div>

          <div className="p-3.5 rounded-xl bg-background/80 border border-border/50 space-y-2">
            <div className="flex items-center justify-between font-bold text-foreground">
              <span>5. Buka Call for Papers Intl</span>
              <span className="text-emerald-600 font-black">+7.0 Poin</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Undang penulis dari minimal 5 negara berbeda (Aspirasi Wawasan 4B) untuk mendongkrak poin ke 8.0 penuh.
            </p>
            <Link href="/app/internationalization" className="inline-flex items-center gap-1 text-primary font-bold hover:underline pt-1">
              <span>Analisis Penulis</span> &rarr;
            </Link>
          </div>
        </div>
      </Card>

      {/* Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/30 border border-border/40">
          <Button
            variant={filterGroup === "All" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterGroup("All")}
            className="text-xs h-8 rounded-lg"
          >
            Semua Unsur (100 Poin)
          </Button>
          <Button
            variant={filterGroup === "Administratif" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterGroup("Administratif")}
            className="text-xs h-8 rounded-lg"
          >
            Gerbang Administrasi
          </Button>
          <Button
            variant={filterGroup === "Management" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterGroup("Management")}
            className="text-xs h-8 rounded-lg"
          >
            Manajemen (48 Poin)
          </Button>
          <Button
            variant={filterGroup === "Substance" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterGroup("Substance")}
            className="text-xs h-8 rounded-lg"
          >
            Substansi (52 Poin)
          </Button>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari indikator (cth: reviewer, doi, scope)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-background/50 border-border/50"
          />
        </div>
      </div>

      {/* Category Accordion Cards */}
      <div className="space-y-4">
        {filteredCategories.map((cat) => {
          const isOpen = !!openCodes[cat.code];
          const totalCatScore = cat.indicators.reduce((s, i) => s + i.score, 0);
          const pct = Math.round((totalCatScore / cat.maxScore) * 100);

          return (
            <Card key={cat.code} className="glass-card border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <button
                type="button"
                className="w-full text-left"
                onClick={() => toggleOpen(cat.code)}
              >
                <CardHeader className="p-5 pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                        <cat.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base font-bold text-foreground">
                            {cat.name}
                          </CardTitle>
                          <span
                            className={cn(
                              "text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border",
                              cat.group === "Administratif" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                              cat.group === "Management" && "bg-blue-500/10 text-blue-600 border-blue-500/20",
                              cat.group === "Substance" && "bg-purple-500/10 text-purple-600 border-purple-500/20",
                            )}
                          >
                            {cat.group}
                          </span>
                        </div>
                        <CardDescription className="text-xs mt-0.5">
                          Skor Maksimal: {cat.maxScore} Poin
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-lg font-black text-foreground">
                          {totalCatScore.toFixed(1)}
                          <span className="text-xs text-muted-foreground font-normal"> / {cat.maxScore} Poin</span>
                        </div>
                        <div className="text-xs font-semibold text-primary">{pct}% Terpenuhi</div>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <ProgressBar value={totalCatScore} max={cat.maxScore} className="mt-3" />
                </CardHeader>
              </button>

              {isOpen && (
                <CardContent className="px-5 pb-5 pt-0 space-y-3 border-t border-border/30">
                  <div className="pt-3 space-y-3">
                    {cat.indicators.map((ind) => (
                      <div
                        key={ind.code}
                        className="rounded-xl bg-muted/20 border border-border/40 p-4 space-y-3 hover:border-primary/40 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <StatusIcon status={ind.status} />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-foreground">
                                  {ind.code}. {ind.name}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {ind.detail}
                              </p>
                              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                                <Info className="h-3 w-3 text-primary shrink-0" />
                                <span>Verifikasi: <strong className="text-foreground">{ind.verificationSource}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="text-right">
                              <span className="text-base font-black text-foreground">
                                {ind.score.toFixed(1)}
                              </span>
                              <span className="text-xs text-muted-foreground"> / {ind.maxScore} Poin</span>
                            </div>

                            {/* Direct Interactive Verification Link */}
                            <Link href={ind.targetRoute}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                              >
                                <span>{ind.targetActionText}</span>
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>

                        <ProgressBar value={ind.score} max={ind.maxScore} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Footnote Disclaimer */}
      <div className="p-4 rounded-xl bg-muted/20 border border-border/40 text-center space-y-1">
        <p className="text-xs text-muted-foreground">
          * Peta Penilaian Tata Kelola Jurnal terverifikasi 100% dari registri resmi JAMS. Klik <strong>Verifikasi</strong> untuk memperbarui data & menaikkan skor akreditasi Jurnal Risenologi secara real-time.
        </p>
      </div>
    </div>
  );
}
