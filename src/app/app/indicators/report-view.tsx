"use client";

import { GranularIndicatorItem } from "./indicator-interactive-list";
import { Button } from "@/components/ui/button";
import { Printer, X, ShieldCheck, CheckCircle2, Award } from "lucide-react";

interface ReportViewProps {
  totalScore: number;
  manajemenScore: number;
  substansiScore: number;
  sintaLevel: string;
  indicators: GranularIndicatorItem[];
  onClose: () => void;
}

export function ReportViewModal({
  totalScore,
  manajemenScore,
  substansiScore,
  sintaLevel,
  indicators,
  onClose,
}: ReportViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-center overflow-y-auto p-4 md:p-8">
      {/* Container */}
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden my-auto print:m-0 print:p-0 print:shadow-none print:w-full print:max-w-none">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex justify-between items-center p-4 bg-slate-900 text-white border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            <span className="font-bold text-sm">Pratinjau Dokumen LED ARJUNA (Siap Cetak / PDF)</span>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              <Printer className="h-4 w-4" /> Cetak / Simpan PDF
            </Button>
            <Button variant="outline" size="icon" onClick={onClose} className="border-slate-700 text-white hover:bg-slate-800">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-led-report" className="p-8 md:p-12 space-y-8 bg-white font-sans">
          {/* HEADER / KOP LEMBAGA */}
          <div className="border-b-2 border-slate-900 pb-6 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">
                LAPORAN EVALUASI DIRI (LED) AKREDITASI JURNAL
              </h1>
              <h2 className="text-sm font-semibold text-slate-700 mt-0.5">
                INSTRUMEN AKREDITASI ARJUNA (KEMENDIKBUDRISTEK / BRIN)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Jurnal Risenologi: Jurnal Sains, Teknologi, Sosial, Pendidikan, dan Bahasa
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded">
                ESTIMASI: {sintaLevel.toUpperCase()}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Dicetak pada: {currentDate}</p>
            </div>
          </div>

          {/* SECTION 1: IDENTITAS JURNAL & DESK EVALUATION */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-2 rounded border border-slate-200">
              I. IDENTITAS JURNAL & GERBANG EVALUASI ADMINISTRATIF
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Nama Jurnal Ilmiah:</span>
                <span className="font-bold text-slate-800">Risenologi</span>
              </div>
              <div>
                <span className="text-slate-500 block">Penerbit & Afiliasi:</span>
                <span className="font-bold text-slate-800">LPPM Universitas Negeri Jakarta (UNJ)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Identifikasi ISSN / E-ISSN:</span>
                <span className="font-bold text-slate-800">2548-2882 (Online) / 2548-2874 (Print)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Status Desk Evaluation:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 8/8 Syarat Wajib Terpenuhi (LULUS)
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: REKAPITULASI SKOR ARJUNA (100 POIN) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-2 rounded border border-slate-200">
              II. REKAPITULASI SKOR PENILAIAN INSTRUMEN ARJUNA (100 POIN)
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 border border-slate-300 rounded bg-slate-50">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Tata Kelola / Manajemen</span>
                <span className="text-2xl font-black text-slate-900">{manajemenScore}</span>
                <span className="text-xs text-slate-500 font-semibold block">/ 48 Poin Maksimal</span>
              </div>
              <div className="p-3 border border-slate-300 rounded bg-slate-50">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Substansi Artikel</span>
                <span className="text-2xl font-black text-slate-900">{substansiScore}</span>
                <span className="text-xs text-slate-500 font-semibold block">/ 52 Poin Maksimal</span>
              </div>
              <div className="p-3 border-2 border-slate-900 rounded bg-amber-50">
                <span className="text-[10px] font-bold uppercase text-amber-900 block">Total Akumulasi Skor</span>
                <span className="text-2xl font-black text-amber-900">{totalScore}</span>
                <span className="text-xs font-bold text-amber-900 block">/ 100 Poin ({sintaLevel})</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: TABEL RINCIAN 32+ INDIKATOR GRANULAR */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-2 rounded border border-slate-200">
              III. RINCIAN EVALUASI GRANULAR 32+ INDIKATOR ARJUNA
            </h3>
            <table className="w-full text-[11px] text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-200 text-slate-800 uppercase font-bold text-[10px]">
                  <th className="border border-slate-300 p-2 w-12 text-center">Kode</th>
                  <th className="border border-slate-300 p-2">Indikator Penilaian</th>
                  <th className="border border-slate-300 p-2 w-20">Kategori</th>
                  <th className="border border-slate-300 p-2 w-16 text-center">Maks</th>
                  <th className="border border-slate-300 p-2 w-16 text-center">Skor</th>
                  <th className="border border-slate-300 p-2">Sumber Data / Catatan</th>
                </tr>
              </thead>
              <tbody>
                {indicators.map((item) => {
                  const score = item.savedScore !== null ? item.savedScore : item.autoScore;
                  return (
                    <tr key={item.code} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="border border-slate-300 p-1.5 font-bold text-center">{item.code}</td>
                      <td className="border border-slate-300 p-1.5 font-medium">{item.name}</td>
                      <td className="border border-slate-300 p-1.5 text-[10px]">{item.category}</td>
                      <td className="border border-slate-300 p-1.5 text-center">{item.maxScore}</td>
                      <td className="border border-slate-300 p-1.5 font-bold text-center text-slate-900">{score}</td>
                      <td className="border border-slate-300 p-1.5 text-[10px] text-slate-600">
                        {item.scoreSource === "verifikasi_manusia" ? "Verifikasi Asesor" : "Auto Database"}
                        {item.notes ? ` — "${item.notes}"` : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* SECTION 4: LEMBAR PENGESAHAN */}
          <div className="pt-8 border-t border-slate-300">
            <p className="text-xs text-slate-600 mb-6 text-center italic">
              Demikian Laporan Evaluasi Diri (LED) ini disusun secara faktual berdasarkan basis data Risenologi JAMS.
            </p>
            <div className="grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <p className="font-semibold text-slate-700">Mengetahui,</p>
                <p className="font-bold text-slate-900 mt-1">Editor-in-Chief Jurnal Risenologi</p>
                <div className="h-16"></div>
                <p className="font-bold text-slate-900 underline">(...................................................)</p>
                <p className="text-[10px] text-slate-500">NIP. .................................................</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700">Disusun oleh,</p>
                <p className="font-bold text-slate-900 mt-1">Journal Manager / Tim Akreditasi</p>
                <div className="h-16"></div>
                <p className="font-bold text-slate-900 underline">(...................................................)</p>
                <p className="text-[10px] text-slate-500">NIP. .................................................</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
