"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  ChevronRight,
  X,
  Printer,
  Lightbulb,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface IndicatorDetail {
  name: string;
  score: number;
  max?: number;
}

export interface IndicatorItem {
  id: string;
  name: string;
  maxScore: number;
  currentScore: number;
  status: "good" | "warning" | "critical";
  recommendation: string;
  details: IndicatorDetail[];
}

interface IndicatorInteractiveListProps {
  initialIndicators: IndicatorItem[];
  totalScore?: number;
}

export function IndicatorInteractiveList({
  initialIndicators,
  totalScore,
}: IndicatorInteractiveListProps) {
  const indicators = initialIndicators;
  const calculatedTotal =
    totalScore ?? Number(indicators.reduce((s, i) => s + i.currentScore, 0).toFixed(1));
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorItem | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "critical":
        return <AlertCircle className="h-5 w-5 text-rose-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40";
      case "warning":
        return "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40";
      case "critical":
        return "border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40";
      default:
        return "border-border/50 bg-background/50";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rincian Indikator Akreditasi</h1>
          <p className="text-muted-foreground mt-1">
            Pantau seluruh 8 kriteria penilaian instrumen ARJUNA (Akreditasi Jurnal Nasional).
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="gap-2 bg-background/50 border-border/50"
          >
            <Printer className="h-4 w-4" /> Cetak Laporan
          </Button>
          <div className="flex flex-col items-end">
            <div className="text-xs text-muted-foreground mb-0.5">Estimasi Skor Akreditasi</div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-primary">{calculatedTotal}</span>
              <span className="text-sm text-muted-foreground font-semibold">/ 100 Poin</span>
            </div>
          </div>
        </div>
      </div>

      <Progress value={totalScore} className="h-3 w-full" />

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {indicators.map((indicator, idx) => (
          <Card
            key={indicator.id}
            onClick={() => setSelectedIndicator(indicator)}
            className={`glass-card border animate-in-fade transition-all duration-300 hover:shadow-lg cursor-pointer group ${getStatusColor(indicator.status)}`}
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <CardHeader className="pb-3 border-b border-border/30 bg-background/20">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getStatusIcon(indicator.status)}</div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      Indikator {indicator.id}: {indicator.name}
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs">
                      Klik untuk melihat rincian & rekomendasi perbaikan
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-end bg-background/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border/50 shrink-0">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    Skor
                  </span>
                  <div className="font-bold text-base text-foreground">
                    {indicator.currentScore}{" "}
                    <span className="text-muted-foreground text-xs font-normal">
                      / {indicator.maxScore}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-2">
                {indicator.details.map((detail, dIdx) => (
                  <div
                    key={dIdx}
                    className="flex justify-between items-center text-xs border-b border-border/20 pb-2 last:border-0 last:pb-0"
                  >
                    <span className="text-foreground/80 pr-4 truncate">{detail.name}</span>
                    <span className="font-medium whitespace-nowrap bg-muted/60 px-2 py-0.5 rounded text-[11px] text-muted-foreground">
                      {detail.score} / {detail.max || indicator.maxScore}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end text-xs font-semibold text-primary pt-1 group-hover:translate-x-1 transition-transform">
                <span>Rincian & Evaluasi</span>
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Indicator Detail Modal */}
      {selectedIndicator && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-xl overflow-hidden animate-in-fade">
            <div className="flex justify-between items-center p-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                {getStatusIcon(selectedIndicator.status)}
                <div>
                  <h2 className="text-xl font-bold">
                    Indikator {selectedIndicator.id}: {selectedIndicator.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Target Maksimal: {selectedIndicator.maxScore} Poin
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedIndicator(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center p-4 rounded-lg bg-muted/20 border border-border/50">
                <span className="text-sm font-semibold">Skor Pencapaian Saat Ini</span>
                <span className="text-2xl font-black text-primary">
                  {selectedIndicator.currentScore} / {selectedIndicator.maxScore} Poin
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground">Rincian Sub-Indikator:</h3>
                <div className="space-y-2">
                  {selectedIndicator.details.map((d, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-3 rounded-lg border border-border/40 bg-background/50 text-sm"
                    >
                      <span className="pr-4">{d.name}</span>
                      <span className="font-bold text-xs bg-muted px-2.5 py-1 rounded">
                        {d.score} / {d.max || selectedIndicator.maxScore}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-1.5">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Lightbulb className="h-4 w-4" /> Rekomendasi Peningkatan Skor:
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  {selectedIndicator.recommendation}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-border/50 bg-muted/20 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedIndicator(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
