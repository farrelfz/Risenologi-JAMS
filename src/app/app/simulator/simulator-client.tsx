"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Zap, Info, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function RangeSlider({
  min,
  max,
  step,
  value,
  onChange,
  label,
}: {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  label?: string;
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 rounded-full accent-primary bg-muted/40 cursor-pointer"
      aria-label={label}
    />
  );
}

interface SimulatorClientProps {
  baseManagement: number;
  baseSubstance: number;
  baseReviewerCountries: number;
  baseIntlRatio: number;
  baseEdBoardCountries: number;
  baseDoiRatio: number;
  baseDeskPassed: number;
  baseArticleCount: number;
}

function predictSinta(score: number): { level: string; color: string; minScore: number } {
  if (score >= 85) return { level: "Sinta 1", color: "text-emerald-500", minScore: 85 };
  if (score >= 70) return { level: "Sinta 2", color: "text-blue-500", minScore: 70 };
  if (score >= 60) return { level: "Sinta 3", color: "text-amber-500", minScore: 60 };
  if (score >= 50) return { level: "Sinta 4", color: "text-orange-500", minScore: 50 };
  return { level: "Sinta 5/6", color: "text-destructive", minScore: 0 };
}

export function SimulatorClient({
  baseManagement,
  baseSubstance,
  baseReviewerCountries,
  baseIntlRatio,
  baseEdBoardCountries,
  baseDoiRatio,
  baseDeskPassed,
  baseArticleCount,
}: SimulatorClientProps) {
  const [simReviewerCountries, setSimReviewerCountries] = useState(baseReviewerCountries);
  const [simIntlRatio, setSimIntlRatio] = useState(Math.round(baseIntlRatio * 100));
  const [simEdBoardCountries, setSimEdBoardCountries] = useState(baseEdBoardCountries);
  const [simDoiRatio, setSimDoiRatio] = useState(Math.round(baseDoiRatio * 100));
  const [simAuthorCountries, setSimAuthorCountries] = useState(1);
  const [simHasIndexScopus, setSimHasIndexScopus] = useState(false);

  // Recompute Management score based on sliders
  const scoreA = 1; // Penamaan (static)
  const scoreB = 3; // Kelembagaan (static: penerbit ada)

  const score3A =
    simReviewerCountries >= 4 && simIntlRatio / 100 > 0.5 ? 6 : simReviewerCountries >= 2 ? 4 : 2;
  const score3B = simEdBoardCountries >= 4 ? 5 : simEdBoardCountries >= 2 ? 3 : 1;
  const scoreC_others = 3.5;
  const scoreC = score3A + score3B + scoreC_others;

  const scoreG = 7; // static
  const score8C = simDoiRatio / 100 >= 1 ? 1 : simDoiRatio / 100 > 0.5 ? 0.5 : 0;
  const score8B = simHasIndexScopus ? 8 : 6;
  const scoreH = score8C + score8B;

  const simManagement = scoreA + scoreB + scoreC + scoreG + scoreH;

  // Recompute Substance
  const aspirationScore =
    simAuthorCountries >= 5
      ? 8
      : simAuthorCountries >= 4
        ? 6
        : simAuthorCountries >= 3
          ? 4
          : simAuthorCountries >= 2
            ? 2
            : 0;
  const cakupanScore = 3; // static
  const simSubstance = cakupanScore + aspirationScore;
  const simTotal = simManagement + simSubstance;

  const basePrediction = predictSinta(baseManagement + baseSubstance);
  const simPrediction = predictSinta(simTotal);
  const delta = simTotal - (baseManagement + baseSubstance);

  const handleReset = () => {
    setSimReviewerCountries(baseReviewerCountries);
    setSimIntlRatio(Math.round(baseIntlRatio * 100));
    setSimEdBoardCountries(baseEdBoardCountries);
    setSimDoiRatio(Math.round(baseDoiRatio * 100));
    setSimAuthorCountries(1);
    setSimHasIndexScopus(false);
  };

  return (
    <div className="space-y-6">
      <Alert className="border-amber-500/30 bg-amber-500/5">
        <Info className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-700 font-semibold text-sm">
          Simulator — Bukan Jaminan Hasil Resmi
        </AlertTitle>
        <AlertDescription className="text-amber-600/80 text-xs mt-1">
          Simulasi ini memperkirakan efek skenario perbaikan terhadap estimasi skor berdasarkan
          rubrik Arjuna Instrumen Periode II 2025. Hasil ini{" "}
          <strong>bukan prediksi akreditasi resmi</strong>. Komponen Substance dengan data terbatas
          (sitasi, dampak ilmiah) belum dapat disimulasikan secara akurat — hanya variabel yang ada
          datanya yang disertakan.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current vs Simulated */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Perbandingan Skor</CardTitle>
            <CardDescription className="text-xs">Saat ini vs. Skenario Simulasi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="text-center p-3 rounded-xl bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground mb-1">Saat Ini</p>
                <p className="text-4xl font-black text-foreground">
                  {(baseManagement + baseSubstance).toFixed(1)}
                </p>
                <p className={cn("text-xs font-bold mt-1", basePrediction.color)}>
                  {basePrediction.level}
                </p>
              </div>
              <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-xs text-primary mb-1">Simulasi</p>
                <p className="text-4xl font-black text-primary">{simTotal.toFixed(1)}</p>
                <p className={cn("text-xs font-bold mt-1", simPrediction.color)}>
                  {simPrediction.level}
                </p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <span
                className={cn(
                  "text-2xl font-black",
                  delta > 0
                    ? "text-emerald-500"
                    : delta < 0
                      ? "text-destructive"
                      : "text-muted-foreground",
                )}
              >
                {delta > 0 ? "+" : ""}
                {delta.toFixed(1)} poin
              </span>
              <p className="text-xs text-muted-foreground mt-1">dari skenario ini</p>
            </div>

            {/* Target bar */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Menuju Sinta 3 (60 poin)</span>
                <span className="font-semibold text-foreground">
                  {Math.max(0, 60 - simTotal).toFixed(1)} kurang
                </span>
              </div>
              <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (simTotal / 60) * 100)}%` }}
                />
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4 text-xs"
              onClick={handleReset}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Reset ke Data Saat Ini
            </Button>
          </CardContent>
        </Card>

        {/* Sliders */}
        <Card className="glass-card border-border/50 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Atur Skenario Perbaikan</CardTitle>
            <CardDescription className="text-xs">
              Geser slider untuk melihat proyeksi dampak skor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Reviewer countries */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="font-medium text-foreground">Jumlah Negara Reviewer (3A)</label>
                <span className="font-bold text-primary">{simReviewerCountries} negara</span>
              </div>
              <RangeSlider
                min={1}
                max={10}
                step={1}
                value={simReviewerCountries}
                onChange={setSimReviewerCountries}
                label="Jumlah Negara Reviewer"
              />
              <p className="text-xs text-muted-foreground">
                Skor 3A: {score3A}/6. Saat ini: {baseReviewerCountries} negara. Target 4+ untuk skor
                penuh.
              </p>
            </div>

            {/* Reviewer intl ratio */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="font-medium text-foreground">
                  Rasio Reviewer Internasional (3A)
                </label>
                <span className="font-bold text-primary">{simIntlRatio}%</span>
              </div>
              <RangeSlider
                min={0}
                max={100}
                step={5}
                value={simIntlRatio}
                onChange={setSimIntlRatio}
                label="Rasio Reviewer Internasional"
              />
              <p className="text-xs text-muted-foreground">
                Saat ini: {(baseIntlRatio * 100).toFixed(0)}%. Target &gt;50% untuk skor penuh.
              </p>
            </div>

            {/* Editorial board countries */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="font-medium text-foreground">
                  Jumlah Negara Dewan Penyunting (3B)
                </label>
                <span className="font-bold text-primary">{simEdBoardCountries} negara</span>
              </div>
              <RangeSlider
                min={1}
                max={8}
                step={1}
                value={simEdBoardCountries}
                onChange={setSimEdBoardCountries}
                label="Jumlah Negara Dewan Penyunting"
              />
              <p className="text-xs text-muted-foreground">
                Skor 3B: {score3B}/5. Saat ini: {baseEdBoardCountries} negara.
              </p>
            </div>

            {/* DOI ratio */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="font-medium text-foreground">
                  Persentase Artikel Ber-DOI (8C)
                </label>
                <span className="font-bold text-primary">{simDoiRatio}%</span>
              </div>
              <RangeSlider
                min={0}
                max={100}
                step={5}
                value={simDoiRatio}
                onChange={setSimDoiRatio}
                label="Persentase Artikel Ber-DOI"
              />
              <p className="text-xs text-muted-foreground">Skor 8C: {score8C}/1.</p>
            </div>

            {/* Author countries */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="font-medium text-foreground">
                  Jumlah Negara Penulis — Aspirasi Wawasan (4B)
                </label>
                <span className="font-bold text-primary">{simAuthorCountries} negara</span>
              </div>
              <RangeSlider
                min={1}
                max={10}
                step={1}
                value={simAuthorCountries}
                onChange={setSimAuthorCountries}
                label="Jumlah Negara Penulis"
              />
              <p className="text-xs text-muted-foreground">
                Skor 4B: {aspirationScore}/8 poin. Ini pengungkit terbesar Substance!
              </p>
            </div>

            {/* Scopus */}
            <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/10 p-3.5">
              <div>
                <p className="text-sm font-medium text-foreground">Terdaftar di Scopus/WoS (8B)</p>
                <p className="text-xs text-muted-foreground">
                  Menambah +2 poin Lembaga Pengindeks (dari 6 ke 8)
                </p>
              </div>
              <button
                onClick={() => setSimHasIndexScopus(!simHasIndexScopus)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  simHasIndexScopus ? "bg-primary" : "bg-muted",
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow",
                    simHasIndexScopus ? "translate-x-6" : "translate-x-1",
                  )}
                />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
