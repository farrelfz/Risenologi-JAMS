"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ShieldCheck,
  Lightbulb,
  Globe,
  ShieldAlert,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  Users,
  Award,
  Zap,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  BookOpen,
  ChevronRight,
  Activity,
  Database,
} from "lucide-react";
import {
  runFullJournalAudit,
  lookupCrossref,
  AuditAnalysisResult,
  IndicatorEvidence,
} from "@/features/auditor/actions";
import { generateGroqAiActionPlan } from "@/features/intelligence/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface IntelligenceHubClientProps {
  initialAudit: AuditAnalysisResult;
  journal: any;
  reviewers: any[];
  editorialBoard: any[];
  articleAuthors: any[];
  articles: any[];
  editions: any[];
}

export function IntelligenceHubClient({
  initialAudit,
  journal,
  reviewers,
  editorialBoard,
  articleAuthors,
  articles,
  editions,
}: IntelligenceHubClientProps) {
  const [activeTab, setActiveTab] = useState<
    "auditor" | "recommendations" | "internationalization" | "risks"
  >("auditor");
  const [audit, setAudit] = useState<AuditAnalysisResult>(initialAudit);
  const [isScanning, setIsScanning] = useState(false);

  // Groq AI State
  const [groqPlan, setGroqPlan] = useState<string | null>(null);
  const [isGroqLoading, setIsGroqLoading] = useState(false);

  const handleGenerateGroqPlan = async () => {
    setIsGroqLoading(true);
    try {
      const res = await generateGroqAiActionPlan();
      if (res.success && res.actionPlan) {
        setGroqPlan(res.actionPlan);
        toast.success("Groq AI Action Plan berhasil dibuat super cepat!");
      } else {
        toast.error(res.error || "Gagal membuat Groq AI Action Plan.");
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan sistem saat mengontak Groq AI Engine.");
    } finally {
      setIsGroqLoading(false);
    }
  };

  // Auditor tab states
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<
    "All" | "Management" | "Substance" | "Administratif" | "Zero"
  >("All");
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  // Crossref lookup states
  const [crossrefQuery, setCrossrefQuery] = useState("");
  const [isCrossrefLoading, setIsCrossrefLoading] = useState(false);
  const [crossrefResults, setCrossrefResults] = useState<any[] | null>(null);
  const [crossrefError, setCrossrefError] = useState<string | null>(null);

  const handleRunScan = async () => {
    setIsScanning(true);
    try {
      const result = await runFullJournalAudit();
      setAudit(result);
      toast.success("Audit AI Real-Time berhasil diperbarui!");
    } catch (e: any) {
      toast.error("Gagal menjalankan scan audit: " + (e.message || "Error"));
    } finally {
      setIsScanning(false);
    }
  };

  const handleCrossrefSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crossrefQuery.trim()) return;
    setIsCrossrefLoading(true);
    setCrossrefError(null);
    setCrossrefResults(null);
    try {
      const res = await lookupCrossref(crossrefQuery);
      if (res.success && res.data) {
        setCrossrefResults(res.data);
        toast.success(`Ditemukan ${res.data.length} metadata di Crossref`);
      } else {
        setCrossrefError(res.error || "Metadata tidak ditemukan di Crossref");
      }
    } catch (err: any) {
      setCrossrefError(err.message || "Gagal menghubungi server Crossref");
    } finally {
      setIsCrossrefLoading(false);
    }
  };

  // ── Internationalization Data ──────────────────────────────────────
  const countByCountry = (items: any[], countryField = "negara") => {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      const c = item[countryField] || "Tidak Diketahui";
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([country, count]) => ({ country, count }));
  };

  const reviewerByCountry = countByCountry(reviewers);
  const intlReviewers = reviewers.filter(
    (r) => r.kualifikasi_internasional || (r.negara && r.negara !== "Indonesia"),
  ).length;
  const intlReviewerRatio = reviewers.length > 0 ? intlReviewers / reviewers.length : 0;

  const edBoardByCountry = countByCountry(editorialBoard);
  const intlEdBoard = editorialBoard.filter(
    (e: any) => e.negara && e.negara !== "Indonesia",
  ).length;
  const intlEdBoardRatio = editorialBoard.length > 0 ? intlEdBoard / editorialBoard.length : 0;

  const authorByCountry = countByCountry(articleAuthors);
  const intlAuthors = articleAuthors.filter(
    (a: any) => a.negara && a.negara !== "Indonesia",
  ).length;
  const authorCountries = Array.from(
    new Set(articleAuthors.map((a: any) => a.negara).filter((c: string) => c && c !== "Indonesia")),
  );
  const intlAuthorRatio = articleAuthors.length > 0 ? intlAuthors / articleAuthors.length : 0;

  const aspirationScore =
    authorCountries.length >= 5
      ? 8
      : authorCountries.length >= 4
        ? 6
        : authorCountries.length >= 3
          ? 4
          : authorCountries.length >= 2
            ? 2
            : 0;
  const mitraBestariScore =
    reviewerByCountry.map((c) => c.country).filter((c) => c !== "Indonesia").length >= 4 &&
    intlReviewerRatio > 0.5
      ? 6
      : reviewerByCountry.length >= 2
        ? 4
        : 2;
  const dewanScore =
    edBoardByCountry.map((c) => c.country).filter((c) => c !== "Indonesia").length >= 4 &&
    intlEdBoardRatio > 0.5
      ? 5
      : edBoardByCountry.length >= 2
        ? 3
        : 1;
  const totalIntlScore = aspirationScore + mitraBestariScore + dewanScore;

  // ── Risk Radar Data ────────────────────────────────────────────────
  const articlesWithDoi = articles.filter((a: any) => a.doi && a.doi.trim()).length;
  const doiRatio = articles.length > 0 ? articlesWithDoi / articles.length : 0;
  const articlesNoAbstrak = articles.filter((a: any) => !a.abstrak || a.abstrak.length < 50).length;

  const risks = [
    {
      id: "reviewer-diversity",
      category: "Diversitas Reviewer",
      title: "Keanekaragaman Mitra Bestari",
      description: "Mempengaruhi skor 3A (Mitra Bestari, 6 poin).",
      severity:
        reviewers.length === 0 || reviewerByCountry.length < 2
          ? "HIGH"
          : reviewerByCountry.length < 4
            ? "MEDIUM"
            : "OK",
      evidence: `${reviewers.length} reviewer dari ${reviewerByCountry.length} negara, ${(intlReviewerRatio * 100).toFixed(0)}% internasional.`,
      recommendation:
        reviewerByCountry.length < 4
          ? `Tambahkan reviewer dari ${4 - reviewerByCountry.length} negara lagi dan targetkan >50% internasional.`
          : "Diversitas reviewer sudah memadai.",
    },
    {
      id: "reference-quality",
      category: "Mutu Referensi",
      title: "Kelengkapan Metadata Artikel",
      description: "DOI dan abstrak mempengaruhi skor Substance & identitas unik.",
      severity:
        doiRatio < 0.5 || articlesNoAbstrak > articles.length * 0.3
          ? "HIGH"
          : doiRatio < 1 || articlesNoAbstrak > 0
            ? "MEDIUM"
            : "OK",
      evidence: `${articlesWithDoi}/${articles.length} artikel ber-DOI. ${articlesNoAbstrak} artikel tanpa abstrak memadai.`,
      recommendation:
        doiRatio < 1
          ? `Lengkapi ${articles.length - articlesWithDoi} artikel yang belum ber-DOI.`
          : "Metadata artikel lengkap.",
    },
    {
      id: "publication-delay",
      category: "Keterlambatan Publikasi",
      title: "Konsistensi Jadwal Terbit",
      description: "Mempengaruhi indikator G7 (Jadwal Terbit, 1 poin).",
      severity: editions.length === 0 ? "HIGH" : "OK",
      evidence: `${editions.length} edisi terdaftar. Jadwal terbit 2x per tahun.`,
      recommendation:
        editions.length === 0
          ? "Daftarkan edisi terbitan baru."
          : "Konsistensi jadwal terbit terpantau baik.",
    },
    {
      id: "desk-evaluation",
      category: "Administratif",
      title: "Status Desk Evaluation",
      description: "Gugur otomatis jika ada 1 syarat yang tidak terpenuhi.",
      severity: audit.failedDeskCount > 2 ? "HIGH" : audit.failedDeskCount > 0 ? "MEDIUM" : "OK",
      evidence: `${8 - audit.failedDeskCount}/8 syarat terpenuhi.`,
      recommendation:
        audit.failedDeskCount > 0
          ? "Selesaikan syarat desk evaluation segera."
          : "Desk evaluation bersih.",
    },
    {
      id: "indexing-status",
      category: "Indeksasi",
      title: "Status Indeksasi Internasional",
      description: "Lembaga Pengindeks (8B, max 8 poin).",
      severity: "MEDIUM",
      evidence:
        "Terindeks di DOAJ, Crossref, Google Scholar, Sinta, Garuda (~6/8 poin). Belum Scopus/WoS.",
      recommendation: "Daftarkan ke DOAJ terlebih dahulu sebagai rintisan menuju Scopus.",
    },
  ];

  // ── Recommendations Data ───────────────────────────────────────────
  const recommendations = [
    {
      id: "desk-eval",
      priority: 1,
      title: `Selesaikan Desk Evaluation (${audit.failedDeskCount} item belum terpenuhi)`,
      description: `Jurnal tidak akan dinilai substansinya jika syarat administratif ini belum selesai.`,
      category: "Administratif",
      potentialGain: 0,
      effort: "Rendah",
      actionHref: "/app/desk-evaluation",
      actionLabel: "Buka Desk Evaluation",
    },
    {
      id: "reviewer-countries",
      priority: 2,
      title: `Tambah Reviewer dari ${Math.max(0, 4 - reviewerByCountry.length)} Negara Lagi`,
      description: `Mitra Bestari (3A, max 6 poin) membutuhkan ≥4 negara + >50% internasional.`,
      category: "Management",
      potentialGain: reviewerByCountry.length < 2 ? 4 : 2,
      effort: "Tinggi",
      actionHref: "/app/registry/reviewers",
      actionLabel: "Kelola Reviewer",
    },
    {
      id: "doi",
      priority: 3,
      title: `Lengkapi DOI untuk ${articles.length - articlesWithDoi} Artikel`,
      description: `Identitas Unik Artikel (8C, 1 poin) membutuhkan 100% DOI aktif dari Crossref.`,
      category: "Management",
      potentialGain: doiRatio < 0.5 ? 1 : 0.5,
      effort: "Menengah",
      actionHref: "/app/manuscripts",
      actionLabel: "Lihat Naskah",
    },
    {
      id: "author-countries",
      priority: 4,
      title: "Tingkatkan Keberagaman Negara Penulis",
      description: "Aspirasi Wawasan (4B, max 8 poin) diukur dari keberagaman negara penulis.",
      category: "Substance",
      potentialGain: 7,
      effort: "Tinggi",
    },
    {
      id: "citations",
      priority: 5,
      title: "Tingkatkan Visibilitas & Citations",
      description:
        "Dampak Ilmiah (4C, max 8 poin) diukur dari jumlah sitasi di Google Scholar & Garuda.",
      category: "Substance",
      potentialGain: 5,
      effort: "Tinggi",
    },
  ].filter((r) => r.potentialGain >= 0);

  const filteredEvidenceItems = audit.evidenceItems.filter((item) => {
    const matchesGroup =
      groupFilter === "All"
        ? true
        : groupFilter === "Zero"
          ? item.score === 0 ||
            item.verificationStatus === "BELUM_DIVERIFIKASI" ||
            item.score < item.maxScore / 2
          : item.group === groupFilter;
    const matchesSearch =
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.evidenceText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar with scan trigger */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/20 p-4 rounded-2xl border border-border/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground leading-tight">
              Pusat Intelijen Akreditasi
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Skor Audit Real-Time:{" "}
              <strong className="text-foreground">{audit.overallScore.toFixed(1)}/100 Poin</strong>{" "}
              · Diperbarui{" "}
              {new Date(audit.timestamp).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateGroqPlan}
            disabled={isGroqLoading}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-sm gap-1.5"
          >
            {isGroqLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 text-amber-300 fill-amber-300" />
            )}
            {isGroqLoading ? "Mengontak Groq..." : "Generate AI Action Plan (Groq)"}
          </Button>
          <Button onClick={handleRunScan} disabled={isScanning} size="sm" variant="outline" className="shadow-sm">
            {isScanning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Scan Audit Real-Time
          </Button>
        </div>
      </div>

      {/* Groq AI Action Plan Widget */}
      {groqPlan && (
        <Card className="glass-card border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-purple-500/10">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-600">
                <Zap className="h-4 w-4 fill-purple-600" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Groq AI Action Plan — Roadmap to Sinta 1
                </CardTitle>
                <CardDescription className="text-xs">
                  Analisis rekomendasi berbasis Groq LLaMA-3.3 Cloud Engine (Respon &lt;1 Detik)
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setGroqPlan(null)} className="h-7 text-xs text-muted-foreground">
              Tutup
            </Button>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="whitespace-pre-wrap text-xs text-foreground leading-relaxed bg-background/60 p-4 rounded-xl border border-purple-500/20 font-mono">
              {groqPlan}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-1.5 bg-muted/30 p-1.5 rounded-2xl border border-border/40 overflow-x-auto">
        {[
          {
            id: "auditor",
            label: "AI Auditor & Jejak Bukti",
            icon: ShieldCheck,
            badge: `${audit.evidenceItems.filter((i) => i.verificationStatus === "TERVERIFIKASI").length}/${audit.evidenceItems.length}`,
          },
          {
            id: "recommendations",
            label: "Rekomendasi AI",
            icon: Lightbulb,
            badge: `${recommendations.length} Aksi`,
          },
          {
            id: "internationalization",
            label: "Internasionalisasi",
            icon: Globe,
            badge: `${totalIntlScore}/19 Poin`,
          },
          {
            id: "risks",
            label: "Deteksi Risiko AI",
            icon: ShieldAlert,
            badge: `${risks.filter((r) => r.severity === "HIGH").length} Kritis`,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex-1 justify-center",
                isActive
                  ? "bg-background text-foreground shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
              )}
            >
              <Icon
                className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")}
              />
              <span>{tab.label}</span>
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-1",
                  isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: AI AUDITOR & JEJAK BUKTI */}
      {activeTab === "auditor" && (
        <div className="space-y-6 animate-in-fade">
          {/* Summary bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="glass-card border border-border/50 rounded-xl p-3.5 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground truncate">
                  Skor Audit Total
                </p>
                <p className="text-2xl font-black text-foreground mt-0.5">
                  {audit.overallScore.toFixed(1)}
                  <span className="text-xs font-normal text-muted-foreground">/100</span>
                </p>
              </div>
            </div>
            <div className="glass-card border border-border/50 rounded-xl p-3.5 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                <Database className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground truncate">
                  Management (49)
                </p>
                <p className="text-2xl font-black text-blue-500 mt-0.5">
                  {audit.managementScore.toFixed(1)}
                </p>
              </div>
            </div>
            <div className="glass-card border border-border/50 rounded-xl p-3.5 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground truncate">Substance (51)</p>
                <p className="text-2xl font-black text-purple-500 mt-0.5">
                  {audit.substanceScore.toFixed(1)}
                </p>
              </div>
            </div>
            <div className="glass-card border border-border/50 rounded-xl p-3.5 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground truncate">
                  Bukti Terverifikasi
                </p>
                <p className="text-2xl font-black text-emerald-500 mt-0.5">
                  {
                    audit.evidenceItems.filter((i) => i.verificationStatus === "TERVERIFIKASI")
                      .length
                  }
                  <span className="text-xs font-normal text-muted-foreground">
                    /{audit.evidenceItems.length}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Crossref Tool */}
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" /> Deteksi Metadata Crossref Live
              </CardTitle>
              <CardDescription className="text-xs">
                Deteksi metadata & DOI artikel langsung dari API resmi Crossref.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <form onSubmit={handleCrossrefSearch} className="flex gap-2">
                <Input
                  placeholder="Masukkan Judul Artikel atau DOI (contoh: 10.15408/...)"
                  value={crossrefQuery}
                  onChange={(e) => setCrossrefQuery(e.target.value)}
                  className="text-sm"
                />
                <Button type="submit" disabled={isCrossrefLoading} size="sm">
                  {isCrossrefLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}{" "}
                  Deteksi
                </Button>
              </form>
              {crossrefError && <p className="text-xs text-destructive">{crossrefError}</p>}
              {crossrefResults && (
                <div className="space-y-2 pt-2 border-t border-border/30 max-h-48 overflow-y-auto">
                  {crossrefResults.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-muted/20 border border-border/40 text-xs flex justify-between items-start"
                    >
                      <div>
                        <p className="font-bold text-foreground">{item.title}</p>
                        <p className="text-muted-foreground">
                          {item.publisher} ({item.issuedYear}) · Ref: {item.referenceCount} · DOI:{" "}
                          {item.doi}
                        </p>
                      </div>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline shrink-0"
                        >
                          Buka DOI
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Evidence Grid */}
          <Card className="glass-card border-border/50 overflow-hidden">
            <CardHeader className="border-b border-border/30 bg-muted/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <CardTitle className="text-base">
                    Jejak Bukti Verifikasi (Evidence Traceability)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Klik pada baris indikator untuk membaca analisis bukti akreditasi & rekomendasi
                    tim editor.
                  </CardDescription>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Input
                    placeholder="Cari bukti..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-xs h-8 w-40"
                  />
                  <select
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value as any)}
                    className="text-xs h-8 rounded-md border border-input bg-background px-2"
                  >
                    <option value="All">Semua Bukti</option>
                    <option value="Zero">🔴 Nilai 0 / Poin Hilang</option>
                    <option value="Management">Management</option>
                    <option value="Substance">Substance</option>
                    <option value="Administratif">Administratif</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border/30">
              {filteredEvidenceItems.map((item) => {
                const isExpanded = expandedCode === item.code;
                return (
                  <div key={item.code} className="transition-colors hover:bg-muted/10">
                    <div
                      onClick={() => setExpandedCode(isExpanded ? null : item.code)}
                      className="p-3.5 flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[11px] font-bold shrink-0 border",
                            item.verificationStatus === "TERVERIFIKASI"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/20",
                          )}
                        >
                          {item.code}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-foreground truncate">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {item.evidenceText}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-bold text-foreground">
                          {item.score.toFixed(1)} / {item.maxScore}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-3 pt-1 bg-muted/20 border-t border-border/20 space-y-2 text-xs">
                        <p>
                          <strong>Sumber Bukti:</strong>{" "}
                          <span className="text-foreground font-medium">{item.source}</span>
                        </p>
                        <p>
                          <strong>Rekomendasi Editorial:</strong> {item.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: REKOMENDASI AI */}
      {activeTab === "recommendations" && (
        <div className="space-y-4 animate-in-fade">
          <Alert className="border-border/40 bg-muted/10">
            <Lightbulb className="h-4 w-4 text-primary" />
            <AlertTitle className="text-sm font-medium">Rekomendasi Terprioritas</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground mt-1">
              Diurutkan berdasarkan potensi dampak skor akreditasi tertinggi ke terendah.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <Card
                key={rec.id}
                className="glass-card border-border/50 hover:border-primary/30 transition-colors"
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-foreground">{rec.title}</h4>
                      {rec.potentialGain > 0 && (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5 shrink-0">
                          +{rec.potentialGain} poin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                    {rec.actionHref && (
                      <Link
                        href={rec.actionHref}
                        className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-2 hover:underline"
                      >
                        {rec.actionLabel} <ChevronRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INTERNASIONALISASI */}
      {activeTab === "internationalization" && (
        <div className="space-y-6 animate-in-fade">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card border-border/50">
              <CardContent className="p-4 text-center">
                <span className="text-xs text-muted-foreground">Mitra Bestari (3A)</span>
                <p className="text-3xl font-black text-blue-500 mt-1">{mitraBestariScore}/6 Poin</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Reviewer: {reviewerByCountry.length} negara
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardContent className="p-4 text-center">
                <span className="text-xs text-muted-foreground">Dewan Penyunting (3B)</span>
                <p className="text-3xl font-black text-purple-500 mt-1">{dewanScore}/5 Poin</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Editor: {edBoardByCountry.length} negara
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardContent className="p-4 text-center">
                <span className="text-xs text-muted-foreground">Aspirasi Wawasan (4B)</span>
                <p className="text-3xl font-black text-emerald-500 mt-1">
                  {aspirationScore}/8 Poin
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Penulis: {authorByCountry.length} negara
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Sebaran Reviewer", data: reviewerByCountry, total: reviewers.length },
              {
                title: "Sebaran Dewan Penyunting",
                data: edBoardByCountry,
                total: editorialBoard.length,
              },
              { title: "Sebaran Penulis", data: authorByCountry, total: articleAuthors.length },
            ].map((group) => (
              <Card key={group.title} className="glass-card border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{group.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {group.data.slice(0, 5).map(({ country, count }) => (
                    <div key={country} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{country}</span>
                      <span className="font-bold text-foreground">{count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DETEKSI RISIKO AI */}
      {activeTab === "risks" && (
        <div className="space-y-4 animate-in-fade">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {risks.map((risk) => (
              <Card
                key={risk.id}
                className={cn(
                  "glass-card border p-4 space-y-2",
                  risk.severity === "HIGH"
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-border/50",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    {risk.category}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                      risk.severity === "HIGH"
                        ? "bg-destructive/10 text-destructive border-destructive/20"
                        : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                    )}
                  >
                    {risk.severity}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-foreground">{risk.title}</h4>
                <p className="text-xs text-muted-foreground">{risk.description}</p>
                <div className="pt-2 border-t border-border/30 text-[11px] text-muted-foreground space-y-1">
                  <p>
                    <strong>Temuan:</strong> {risk.evidence}
                  </p>
                  <p>
                    <strong>Rekomendasi:</strong> {risk.recommendation}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
