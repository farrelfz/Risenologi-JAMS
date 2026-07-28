"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Loader2, Award, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { saveArticleSubstanceEvaluation } from "@/features/articles/actions";

interface ArticleRubricItem {
  code: string;
  title: string;
  maxScore: number;
  description: string;
  options: { label: string; score: number }[];
}

export const MANUSCRIPT_RUBRICS: ArticleRubricItem[] = [
  {
    code: "4.4",
    title: "Mutu Judul Artikel",
    maxScore: 1.0,
    description: "Judul ringkas (10-15 kata), informatif, mencerminkan masalah penelitian tanpa singkatan.",
    options: [
      { label: "Spesifik, informatif & tanpa singkatan tidak baku (1.0 Poin)", score: 1.0 },
      { label: "Judul terlalu panjang / memuat singkatan (0.5 Poin)", score: 0.5 },
      { label: "Judul terlalu umum / membingungkan (0 Poin)", score: 0 },
    ],
  },
  {
    code: "4.5",
    title: "Mutu Abstrak & Kata Kunci",
    maxScore: 2.0,
    description: "Abstrak bilingual (Indonesia & Inggris) yang memuat struktur IMRaD lengkap (150-250 kata).",
    options: [
      { label: "Abstrak bilingual lengkap dengan struktur IMRaD (2.0 Poin)", score: 2.0 },
      { label: "Abstrak bilingual tetapi kurang memuat metodologi/implikasi (1.0 Poin)", score: 1.0 },
      { label: "Abstrak satu bahasa saja (0.5 Poin)", score: 0.5 },
    ],
  },
  {
    code: "4.6",
    title: "Mutu Kebaruan (Novelty)",
    maxScore: 5.0,
    description: "Artikel memberikan kontribusi kebaruan ilmiah (novelty) yang dinyatakan tegas pada pendahuluan.",
    options: [
      { label: "Kebaruan sangat tinggi, terbukti dengan state-of-the-art jernih (5.0 Poin)", score: 5.0 },
      { label: "Ada kebaruan tapi pernyataan novelty kurang eksplisit (3.5 Poin)", score: 3.5 },
      { label: "Studi mengulang / konfirmasi penelitian terdahulu (2.0 Poin)", score: 2.0 },
    ],
  },
  {
    code: "4.7",
    title: "Rigor Metodologi",
    maxScore: 4.0,
    description: "Metodologi dijelaskan secara rinci sehingga memungkinkan replikasi oleh peneliti lain.",
    options: [
      { label: "Metode & instrumen sangat rinci dan dapat direplikasi (4.0 Poin)", score: 4.0 },
      { label: "Metode dijelaskan umum tanpa rincian instrumen (2.5 Poin)", score: 2.5 },
      { label: "Metode tidak jelas / membingungkan (1.0 Poin)", score: 1.0 },
    ],
  },
  {
    code: "4.8",
    title: "Kedalaman Analisis & Pembahasan",
    maxScore: 4.0,
    description: "Pembahasan membandingkan temuan dengan teori/pustaka rujukan primer.",
    options: [
      { label: "Pembahasan mendalam dikomparasi dengan rujukan primer (4.0 Poin)", score: 4.0 },
      { label: "Pembahasan memuat komparasi terbatas (2.5 Poin)", score: 2.5 },
      { label: "Pembahasan hanya mengulang angka tabel/grafik (1.0 Poin)", score: 1.0 },
    ],
  },
  {
    code: "4.9",
    title: "Ketepatan & Rigor Simpulan",
    maxScore: 1.0,
    description: "Simpulan menjawab hipotesis/tujuan secara kritis, tidak sekadar mengulang hasil.",
    options: [
      { label: "Simpulan tegas, menjawab masalah & memberi saran ilmiah (1.0 Poin)", score: 1.0 },
      { label: "Simpulan hanya mengulang kalimat ringkasan hasil (0.5 Poin)", score: 0.5 },
    ],
  },
  {
    code: "4.10",
    title: "Kuantitas Pustaka Primer (>80%)",
    maxScore: 1.0,
    description: "Proporsi rujukan primer (artikel jurnal & prosiding) terhadap total daftar pustaka.",
    options: [
      { label: "Proporsi rujukan primer ≥80% dari total daftar pustaka (1.0 Poin)", score: 1.0 },
      { label: "Proporsi rujukan primer 50-79% (0.5 Poin)", score: 0.5 },
      { label: "Proporsi rujukan primer <50% (0.2 Poin)", score: 0.2 },
    ],
  },
  {
    code: "4.11",
    title: "Kemutakhiran Pustaka Rujukan",
    maxScore: 1.0,
    description: "Proporsi rujukan terbit dalam 10 tahun terakhir.",
    options: [
      { label: "Proporsi pustaka mutakhir ≥80% (1.0 Poin)", score: 1.0 },
      { label: "Proporsi pustaka mutakhir 50-79% (0.5 Poin)", score: 0.5 },
      { label: "Proporsi pustaka mutakhir <50% (0.2 Poin)", score: 0.2 },
    ],
  },
];

interface ArticleAuditModalProps {
  article: {
    id: string;
    judul: string;
    penulis: string;
    editionStr: string;
  };
  initialScores?: { [key: string]: number };
  onClose: () => void;
  onSaved?: () => void;
}

export function ArticleAuditModal({
  article,
  initialScores = {},
  onClose,
  onSaved,
}: ArticleAuditModalProps) {
  const [scores, setScores] = useState<{ [key: string]: number }>({
    "4.4": initialScores["4.4"] ?? 1.0,
    "4.5": initialScores["4.5"] ?? 2.0,
    "4.6": initialScores["4.6"] ?? 3.5,
    "4.7": initialScores["4.7"] ?? 2.5,
    "4.8": initialScores["4.8"] ?? 2.5,
    "4.9": initialScores["4.9"] ?? 1.0,
    "4.10": initialScores["4.10"] ?? 0.5,
    "4.11": initialScores["4.11"] ?? 0.5,
  });

  const [catatan, setCatatan] = useState("");
  const [isPending, startTransition] = useTransition();

  const totalScore = Number(
    Object.values(scores)
      .reduce((acc, curr) => acc + (curr || 0), 0)
      .toFixed(1),
  );
  const maxTotalScore = 19.0;

  const handleSelectOption = (code: string, score: number) => {
    setScores((prev) => ({ ...prev, [code]: score }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await saveArticleSubstanceEvaluation(article.id, scores, catatan);
      if (res.success) {
        toast.success(res.message);
        if (onSaved) onSaved();
        onClose();
      } else {
        toast.error("Gagal menyimpan evaluasi naskah.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in-fade">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-border/50 bg-muted/20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1 font-semibold text-xs">
                <Award className="h-3.5 w-3.5" /> Audit Mutu ARJUNA Per-Naskah
              </Badge>
              <Badge variant="outline" className="text-xs">
                {article.editionStr}
              </Badge>
            </div>
            <h2 className="text-base font-bold line-clamp-1">{article.judul}</h2>
            <p className="text-xs text-muted-foreground">Penulis: {article.penulis}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Total Score Header */}
          <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
                Total Skor Substantif Artikel Ini
              </span>
              <span className="text-2xl font-black text-amber-600">
                {totalScore} <span className="text-xs text-muted-foreground font-medium">/ {maxTotalScore} Poin Maksimal</span>
              </span>
            </div>
            <div className="text-right text-xs text-amber-700/80">
              Nilai ini akan menyuplai agregat <br />
              <strong className="text-amber-800">Skor Indikator Substansi (Unsur IV)</strong>
            </div>
          </div>

          {/* Rubrics Items */}
          <div className="space-y-6">
            {MANUSCRIPT_RUBRICS.map((item) => {
              const currentScore = scores[item.code] ?? 0;
              return (
                <div key={item.code} className="space-y-2 border-b border-border/40 pb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-bold text-xs">
                        Item {item.code}
                      </Badge>
                      <h3 className="text-sm font-bold">{item.title}</h3>
                    </div>
                    <span className="text-xs font-semibold text-primary">
                      Skor Terpilih: {currentScore} / {item.maxScore} Poin
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>

                  {/* Rubric Options List */}
                  <div className="space-y-2 pt-1">
                    {item.options.map((opt, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectOption(item.code, opt.score)}
                        className={`p-3 rounded-lg border text-xs flex justify-between items-center cursor-pointer transition-all ${
                          currentScore === opt.score
                            ? "border-primary bg-primary/10 font-semibold"
                            : "border-border/50 hover:bg-muted/40"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <CheckCircle2
                            className={`h-4 w-4 shrink-0 ${
                              currentScore === opt.score ? "text-primary" : "text-muted-foreground/30"
                            }`}
                          />
                          {opt.label}
                        </span>
                        <Badge
                          variant={currentScore === opt.score ? "default" : "secondary"}
                          className="font-bold text-[10px]"
                        >
                          {opt.score} Poin
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Catatan Editor */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-foreground">
              Catatan Evaluasi Mutu Naskah (Optional):
            </label>
            <Textarea
              placeholder="Tambahkan catatan khusus mengenai temuan kebaruan atau perbaikan artikel..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="text-xs min-h-[60px]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 bg-muted/20 flex justify-between items-center">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Tersimpan ke Database Akreditasi
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={isPending} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isPending ? "Menyimpan..." : "Simpan Audit Naskah"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
