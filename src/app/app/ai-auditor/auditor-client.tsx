"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ShieldCheck,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Info,
  Database,
  ExternalLink,
  Sparkles,
  Filter,
  ChevronDown,
  ChevronUp,
  Loader2,
  BookOpen,
} from "lucide-react";
import {
  runFullJournalAudit,
  lookupCrossref,
  AuditAnalysisResult,
  IndicatorEvidence,
} from "@/features/auditor/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AuditorClientProps {
  initialAudit: AuditAnalysisResult;
}

export function AuditorClient({ initialAudit }: AuditorClientProps) {
  const [audit, setAudit] = useState<AuditAnalysisResult>(initialAudit);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<
    "All" | "Management" | "Substance" | "Administratif"
  >("All");
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  // Crossref lookup state
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

  const filteredEvidence = audit.evidenceItems.filter((item) => {
    const matchesGroup = groupFilter === "All" || item.group === groupFilter;
    const matchesSearch =
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.evidenceText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const verifiedCount = audit.evidenceItems.filter(
    (i) => i.verificationStatus === "TERVERIFIKASI",
  ).length;
  const partialCount = audit.evidenceItems.filter((i) => i.verificationStatus === "PARSIAL").length;

  return (
    <div className="space-y-6">
      {/* Header bar with Scan button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/20 p-4 rounded-2xl border border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Status Audit AI Terakhir</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Diperbarui:{" "}
            {new Date(audit.timestamp).toLocaleString("id-ID", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <Button
          onClick={handleRunScan}
          disabled={isScanning}
          className="shadow-md shadow-primary/10"
        >
          {isScanning ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Jalankan Audit AI Real-Time
        </Button>
      </div>

      {/* High-density metric overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card border border-border/50 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Skor Total Audit</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-foreground">
                {audit.overallScore.toFixed(1)}
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">/ 100</span>
            </div>
          </div>
        </div>

        <div className="glass-card border border-border/50 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
            <Database className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Management (49)</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-blue-500">
                {audit.managementScore.toFixed(1)}
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">poin</span>
            </div>
          </div>
        </div>

        <div className="glass-card border border-border/50 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Substance (51)</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-purple-500">
                {audit.substanceScore.toFixed(1)}
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">poin</span>
            </div>
          </div>
        </div>

        <div className="glass-card border border-border/50 rounded-xl p-3.5 flex items-center gap-3">
          <div
            className={cn(
              "p-2.5 rounded-xl shrink-0",
              audit.deskEvaluationPassed
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-destructive/10 text-destructive",
            )}
          >
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">
              Bukti Terverifikasi
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-emerald-500">{verifiedCount}</span>
              <span className="text-[11px] text-muted-foreground font-normal">
                /{audit.evidenceItems.length} indikator
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Crossref Live Lookup & Detection Tool */}
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" /> Alat Pendeteksi & Deteksi DOI (Crossref Live
            Lookup)
          </CardTitle>
          <CardDescription className="text-xs">
            Cari metadata artikel atau verifikasi DOI langsung dari database resmi Crossref API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCrossrefSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Masukkan Judul Artikel atau DOI (contoh: 10.15408/... atau judul artikel)"
                value={crossrefQuery}
                onChange={(e) => setCrossrefQuery(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
            <Button type="submit" disabled={isCrossrefLoading}>
              {isCrossrefLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Deteksi Metadata
            </Button>
          </form>

          {crossrefError && (
            <Alert
              variant="destructive"
              className="bg-destructive/10 border-destructive/20 text-xs py-2"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-semibold">Deteksi Gagal</AlertTitle>
              <AlertDescription>{crossrefError}</AlertDescription>
            </Alert>
          )}

          {crossrefResults && crossrefResults.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/30">
              <span className="text-xs font-semibold text-muted-foreground">
                Hasil Deteksi Crossref:
              </span>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {crossrefResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-muted/20 border border-border/40 text-xs space-y-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-foreground leading-tight">{item.title}</h4>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline shrink-0 flex items-center gap-1"
                        >
                          DOI <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      Penerbit: {item.publisher} · Jurnal: {item.containerTitle} ({item.issuedYear})
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                      <span>
                        Ref Count: <strong>{item.referenceCount}</strong>
                      </span>
                      <span>
                        Cit Count: <strong>{item.isReferencedByCount}</strong>
                      </span>
                      <span>
                        DOI: <code className="bg-muted px-1 rounded">{item.doi}</code>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter and Search Bar for Evidence */}
      <Card className="glass-card border-border/50">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari bukti audit, kode (DE, 3A, H), atau sumber..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-muted/30 p-1 rounded-xl border border-border/40 w-full md:w-auto overflow-x-auto">
            {(["All", "Management", "Substance", "Administratif"] as const).map((grp) => (
              <button
                key={grp}
                onClick={() => setGroupFilter(grp)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap",
                  groupFilter === grp
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {grp === "All" ? "Semua Bukti" : grp}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Evidence Traceability Grid */}
      <Card className="glass-card border-border/50 overflow-hidden">
        <CardHeader className="border-b border-border/30 bg-muted/10">
          <CardTitle className="text-base">Jejak Bukti Audit (Evidence Traceability)</CardTitle>
          <CardDescription className="text-xs">
            Rincian jejak bukti verifikasi untuk setiap indikator penilaian akreditasi.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border/30">
          {filteredEvidence.map((item) => {
            const isExpanded = expandedCode === item.code;
            return (
              <div key={item.code} className="transition-colors hover:bg-muted/10">
                <div
                  onClick={() => setExpandedCode(isExpanded ? null : item.code)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-black shrink-0 border",
                        item.verificationStatus === "TERVERIFIKASI"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : item.verificationStatus === "PARSIAL"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : "bg-destructive/10 text-destructive border-destructive/20",
                      )}
                    >
                      {item.code}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">{item.evidenceText}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-bold text-foreground">
                        {item.score.toFixed(1)} / {item.maxScore}
                      </span>
                      <span className="block text-[10px] text-muted-foreground">
                        {Math.round(item.confidence * 100)}% Keyakinan
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 bg-muted/20 border-t border-border/20 space-y-2 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-lg bg-background border border-border/40 space-y-1">
                        <span className="font-semibold text-foreground">Bukti & Sumber Data:</span>
                        <p className="text-muted-foreground">{item.evidenceText}</p>
                        <p className="text-[11px] text-muted-foreground pt-1">
                          Sumber: <code>{item.source}</code>
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-background border border-border/40 space-y-1">
                        <span className="font-semibold text-primary">Rekomendasi AI Auditor:</span>
                        <p className="text-muted-foreground">{item.recommendation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
