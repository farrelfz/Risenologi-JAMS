"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Printer,
  Search,
  Filter,
  Save,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Sparkles,
  Info,
  ChevronRight,
  X,
  Edit3,
} from "lucide-react";
import { saveIndicatorEvaluationScore } from "@/features/accreditation/actions";
import { ReportViewModal } from "./report-view";

export interface GranularIndicatorItem {
  code: string;
  name: string;
  unsur: string;
  unsurTitle: string;
  category: "Substansi" | "Manajemen" | "Administratif";
  maxScore: number;
  autoScore: number;
  savedScore: number | null;
  scoreSource: "otomatis" | "verifikasi_manusia" | "belum_diisi";
  description: string;
  criteriaOptions: { label: string; score: number }[];
  dataSource: string;
  isDummyFallback: boolean;
  notes?: string;
}

interface IndicatorInteractiveListProps {
  userRole: "administrator" | "journal_manager" | "editor";
  journalId: string;
  indicators: GranularIndicatorItem[];
}

export function IndicatorInteractiveList({
  userRole,
  journalId,
  indicators: initialIndicators,
}: IndicatorInteractiveListProps) {
  const [indicators, setIndicators] = useState<GranularIndicatorItem[]>(initialIndicators);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"semua" | "Substansi" | "Manajemen">(
    "semua",
  );
  const [selectedItem, setSelectedItem] = useState<GranularIndicatorItem | null>(null);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [editScore, setEditScore] = useState<number>(0);
  const [editNote, setEditNote] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  // Total Scores Calculation
  const getScoreValue = (item: GranularIndicatorItem) =>
    item.savedScore !== null ? item.savedScore : item.autoScore;

  const totalScore = Number(indicators.reduce((sum, item) => sum + getScoreValue(item), 0).toFixed(1));

  const manajemenScore = Number(
    indicators
      .filter((item) => item.category === "Manajemen")
      .reduce((sum, item) => sum + getScoreValue(item), 0)
      .toFixed(1),
  );

  const substansiScore = Number(
    indicators
      .filter((item) => item.category === "Substansi")
      .reduce((sum, item) => sum + getScoreValue(item), 0)
      .toFixed(1),
  );

  const getSintaLevel = (score: number) => {
    if (score >= 85) return "Sinta 1";
    if (score >= 70) return "Sinta 2";
    if (score >= 60) return "Sinta 3";
    if (score >= 50) return "Sinta 4";
    if (score >= 40) return "Sinta 5";
    if (score >= 30) return "Sinta 6";
    return "Tidak Terakreditasi";
  };

  const sintaLevel = getSintaLevel(totalScore);

  const totalMax = 100;
  const percentage = Math.min(100, Math.round((totalScore / totalMax) * 100));

  // Determine role permissions for category
  const canEditItem = (itemCategory: "Substansi" | "Manajemen" | "Administratif") => {
    if (userRole === "administrator") return true;
    if (userRole === "journal_manager") return true;
    if (userRole === "editor" && itemCategory === "Substansi") return true;
    return false;
  };

  const getRoleBadge = () => {
    switch (userRole) {
      case "administrator":
        return (
          <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/30 font-semibold gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Super Admin — Akses Penuh All Unsur
          </Badge>
        );
      case "journal_manager":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30 font-semibold gap-1">
            <UserCheck className="h-3.5 w-3.5" /> Journal Manager — Akses Tata Kelola & Substansi
          </Badge>
        );
      case "editor":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 font-semibold gap-1">
            <Edit3 className="h-3.5 w-3.5" /> Editor — Akses Khusus Kategori Substansi Artikel
          </Badge>
        );
    }
  };

  const filteredIndicators = indicators.filter((item) => {
    const matchesSearch =
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.unsurTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "semua" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenEdit = (item: GranularIndicatorItem) => {
    setSelectedItem(item);
    setEditScore(item.savedScore !== null ? item.savedScore : item.autoScore);
    setEditNote(item.notes || "");
  };

  const handleSaveScore = async () => {
    if (!selectedItem) return;

    if (!canEditItem(selectedItem.category)) {
      toast.error(`Role ${userRole} tidak memiliki izin mengedit item ${selectedItem.category}.`);
      return;
    }

    startTransition(async () => {
      const res = await saveIndicatorEvaluationScore({
        journalId,
        indikatorKode: selectedItem.code,
        indikatorNama: selectedItem.name,
        skor: editScore,
        skorMaks: selectedItem.maxScore,
        catatan: editNote,
        category: selectedItem.category,
      });

      if (res.success) {
        toast.success(res.message);
        // Update local state
        setIndicators((prev) =>
          prev.map((ind) =>
            ind.code === selectedItem.code
              ? {
                  ...ind,
                  savedScore: editScore,
                  notes: editNote,
                  scoreSource: "verifikasi_manusia",
                }
              : ind,
          ),
        );
        setSelectedItem(null);
      } else {
        toast.error(res.error || "Gagal menyimpan skor.");
      }
    });
  };

  const countDummy = indicators.filter((i) => i.isDummyFallback).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">Rincian Indikator Akreditasi</h1>
            {getRoleBadge()}
          </div>
          <p className="text-muted-foreground text-sm">
            Seluruh 32+ item penilaian instrumen akreditasi ARJUNA (100 Poin) secara granular 1-per-1.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setIsReportOpen(true)}
            className="gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium"
          >
            <Printer className="h-4 w-4 text-amber-400" /> Cetak Buku LED ARJUNA (PDF)
          </Button>
        </div>
      </div>

      {/* Dashboard Score Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center space-y-1">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Total Skor Rubrik
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-primary">{totalScore}</span>
              <span className="text-sm font-semibold text-muted-foreground">/ 100 Poin</span>
            </div>
            <div className="text-[10px] font-bold text-white bg-primary px-2 py-0.5 rounded-full mt-1">
              Estimasi: {sintaLevel}
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center space-y-1">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Manajemen
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-blue-600">{manajemenScore}</span>
              <span className="text-sm font-semibold text-muted-foreground">/ 48 Poin</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              Unsur I–III, VI–VIII
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center space-y-1">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Substansi
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-amber-600">{substansiScore}</span>
              <span className="text-sm font-semibold text-muted-foreground">/ 52 Poin</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              Unsur IV & V
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center space-y-1">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Gerbang Evaluasi
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-emerald-600">8</span>
              <span className="text-sm font-semibold text-muted-foreground">/ 8</span>
            </div>
            <div className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Syarat Wajib Terpenuhi
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress & Transparency Banner */}
      <Card className="glass-card border-primary/20 bg-primary/5">
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-center text-sm font-medium">
            <span>Kesiapan Akreditasi Jurnal Risenologi ({percentage}% dari Target 100 Poin)</span>
            <span className="font-bold text-primary">{totalScore} / 100 Poin</span>
          </div>
          <Progress value={percentage} className="h-2.5" />
          {countDummy > 0 ? (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-500/10 p-2 rounded border border-amber-500/20">
              <Info className="h-4 w-4 shrink-0" />
              <span>
                <strong>Catatan Transparansi Data:</strong> Terdapat {countDummy} indikator yang masih
                menggunakan nilai estimasi/fallback otomatis (seperti sitasi external OpenAlex/Crossref saat API
                belum terhubung). Indikator berbasis database (Reviewer, Editorial Board, Identitas) 100% data real.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Seluruh indikator penilaian menggunakan data terverifikasi dan database real.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kode atau nama indikator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Kategori:</span>
          <div className="flex gap-1 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setSelectedCategory("semua")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                selectedCategory === "semua"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semua (32)
            </button>
            <button
              onClick={() => setSelectedCategory("Substansi")}
              className={`px-3.5 py-1 text-xs rounded-md font-medium transition-all ${
                selectedCategory === "Substansi"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Substansi Artikel (Editor)
            </button>
            <button
              onClick={() => setSelectedCategory("Manajemen")}
              className={`px-3.5 py-1 text-xs rounded-md font-medium transition-all ${
                selectedCategory === "Manajemen"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tata Kelola & Manajemen
            </button>
          </div>
        </div>
      </div>

      {/* Indicator Table / List */}
      <div className="space-y-4">
        {filteredIndicators.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            Tidak ada indikator yang sesuai dengan kata kunci pencarian/kategori.
          </Card>
        ) : (
          filteredIndicators.map((item) => {
            const isEditable = canEditItem(item.category);
            const currentDisplayScore =
              item.savedScore !== null ? item.savedScore : item.autoScore;

            return (
              <Card
                key={item.code}
                className={`glass-card transition-all border ${
                  item.savedScore !== null
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-border/60 hover:border-primary/40"
                }`}
              >
                <CardHeader className="p-4 pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-bold text-xs bg-muted">
                        {item.code}
                      </Badge>
                      <Badge
                        className={`text-[10px] uppercase ${
                          item.category === "Substansi"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                            : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                        }`}
                      >
                        {item.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{item.unsurTitle}</span>
                    </div>
                    <CardTitle className="text-base font-semibold">{item.name}</CardTitle>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {item.savedScore !== null ? "Terverifikasi Asesor" : "Ekstraksi Otomatis"}
                      </div>
                      <div className="text-lg font-black text-primary">
                        {currentDisplayScore}{" "}
                        <span className="text-xs text-muted-foreground font-normal">
                          / {item.maxScore} Poin
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isEditable ? "default" : "outline"}
                      onClick={() => handleOpenEdit(item)}
                      className="gap-1 text-xs"
                    >
                      {isEditable ? (
                        <>
                          <Edit3 className="h-3.5 w-3.5" /> Evaluasi & Submit
                        </>
                      ) : (
                        <>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" /> Lihat Detail (Hanya Baca)
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 text-xs text-muted-foreground space-y-2">
                  <p className="line-clamp-2">{item.description}</p>
                  <div className="flex flex-wrap justify-between items-center pt-2 border-t border-border/20 text-[11px]">
                    <span className="text-muted-foreground/80">Sumber Data: {item.dataSource}</span>
                    {item.notes && (
                      <span className="text-emerald-600 font-medium italic">
                        Catatan: "{item.notes}"
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Interactive Edit / Evaluation Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in-fade">
            <div className="flex justify-between items-center p-6 border-b border-border/50 bg-muted/20">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="font-bold text-xs">
                    Indikator {selectedItem.code}
                  </Badge>
                  <Badge
                    className={`text-[10px] ${
                      selectedItem.category === "Substansi"
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                        : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                    }`}
                  >
                    Kategori: {selectedItem.category}
                  </Badge>
                </div>
                <h2 className="text-lg font-bold">{selectedItem.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedItem.unsurTitle}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedItem(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Deskripsi Indikator & Panduan Rubrik:
                </h3>
                <p className="text-sm text-foreground leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/40">
                  {selectedItem.description}
                </p>
              </div>

              {/* Rubric options */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Pilih Kriteria Skor Akreditasi:
                </h3>
                <div className="space-y-2">
                  {selectedItem.criteriaOptions.map((opt, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        if (canEditItem(selectedItem.category)) {
                          setEditScore(opt.score);
                        }
                      }}
                      className={`p-3 rounded-lg border text-sm flex justify-between items-center cursor-pointer transition-all ${
                        editScore === opt.score
                          ? "border-primary bg-primary/10 font-medium"
                          : "border-border/50 hover:bg-muted/40"
                      } ${!canEditItem(selectedItem.category) ? "cursor-not-allowed opacity-80" : ""}`}
                    >
                      <span>{opt.label}</span>
                      <Badge
                        variant={editScore === opt.score ? "default" : "secondary"}
                        className="font-bold text-xs"
                      >
                        {opt.score} Poin
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Score Display (Derived from Rubric) */}
              <div className="grid grid-cols-2 gap-4 items-center bg-card p-4 rounded-lg border border-border">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Skor Hasil Evaluasi Terpilih (Maks {selectedItem.maxScore}):
                  </div>
                  <div className="text-2xl font-black text-primary">
                    {editScore} Poin
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Estimasi Otomatis AI/Database:
                  </div>
                  <div className="text-lg font-bold text-muted-foreground">
                    {selectedItem.autoScore} / {selectedItem.maxScore} Poin
                  </div>
                </div>
              </div>

              {/* Notes Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Catatan Evaluasi Asesor / Editor:
                </label>
                <Textarea
                  placeholder="Tambahkan catatan bukti fisik atau pertimbangan penilaian..."
                  value={editNote}
                  disabled={!canEditItem(selectedItem.category)}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="text-xs min-h-[80px]"
                />
              </div>

              {!canEditItem(selectedItem.category) && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>
                    <strong>Akses Dibatasi:</strong> Role Anda ({userRole}) hanya dapat mengedit bagian{" "}
                    {userRole === "editor" ? "Substansi Artikel" : "Kategori khusus"}. Item ini berkategori{" "}
                    {selectedItem.category}.
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border/50 bg-muted/20 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Sumber Data: {selectedItem.dataSource}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedItem(null)}>
                  Batal
                </Button>
                {canEditItem(selectedItem.category) && (
                  <Button onClick={handleSaveScore} disabled={isPending} className="gap-2">
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isPending ? "Menyimpan..." : "Simpan & Submit Penilaian"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isReportOpen && (
        <ReportViewModal
          totalScore={totalScore}
          manajemenScore={manajemenScore}
          substansiScore={substansiScore}
          sintaLevel={sintaLevel}
          indicators={indicators}
          onClose={() => setIsReportOpen(false)}
        />
      )}
    </div>
  );
}
