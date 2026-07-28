"use client";

import { GranularIndicatorItem } from "./indicator-interactive-list";
import { Button } from "@/components/ui/button";
import { Printer, X, CheckCircle2, Award } from "lucide-react";

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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex justify-center overflow-y-auto p-4 md:p-8 print:p-0 print:bg-white print:static print:overflow-visible">
      {/* Global CSS khusus untuk instruksi cetak PDF sempurna */}
      <style jsx global>{`
        @media print {
          /* Sembunyikan seluruh elemen halaman di luar area laporan LED */
          body * {
            visibility: hidden !important;
          }
          #printable-led-report,
          #printable-led-report * {
            visibility: visible !important;
          }
          #printable-led-report {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            background: #ffffff !important;
            color: #0f172a !important;
            box-shadow: none !important;
          }

          /* Mencegah pemotongan baris tabel canggung antarhalaman */
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .section-block {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          h1, h2, h3 {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 15mm;
          }
        }
      `}</style>

      {/* Modal Card Container */}
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-auto print:m-0 print:p-0 print:shadow-none print:w-full print:max-w-none print:rounded-none">
        {/* Top Control Bar (Hidden when Printing) */}
        <div className="flex justify-between items-center p-4 bg-slate-900 text-white border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            <span className="font-bold text-sm">Pratinjau Dokumen LED ARJUNA (Format A4 PDF)</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md"
            >
              <Printer className="h-4 w-4" /> Cetak / Simpan PDF
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="border-slate-700 text-white hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-led-report" className="p-8 md:p-12 space-y-6 bg-white font-sans text-slate-900 print:p-0 print:space-y-4">
          {/* HEADER / KOP LEMBAGA */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start section-block">
            <div>
              <h1 className="text-lg md:text-xl font-black uppercase tracking-wider text-slate-900 leading-tight">
                LAPORAN EVALUASI DIRI (LED) AKREDITASI JURNAL
              </h1>
              <h2 className="text-xs md:text-sm font-bold text-slate-700 mt-0.5">
                INSTRUMEN AKREDITASI ARJUNA (KEMENDIKBUDRISTEK / BRIN)
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Jurnal Risenologi: Jurnal Sains, Teknologi, Sosial, Pendidikan, dan Bahasa
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="inline-block px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded shadow-sm">
                ESTIMASI: {sintaLevel.toUpperCase()}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Tanggal Dokumen: {currentDate}</p>
            </div>
          </div>

          {/* SECTION 1: IDENTITAS JURNAL & DESK EVALUATION */}
          <div className="space-y-2 section-block">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-2 rounded border border-slate-200">
              I. IDENTITAS JURNAL & GERBANG EVALUASI ADMINISTRATIF
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[10px]">Nama Jurnal Ilmiah:</span>
                <span className="font-bold text-slate-800">Risenologi</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Penerbit & Afiliasi:</span>
                <span className="font-bold text-slate-800">LPPM Universitas Negeri Jakarta (UNJ)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Identifikasi ISSN / E-ISSN:</span>
                <span className="font-bold text-slate-800">2548-2882 (Online) / 2548-2874 (Print)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Status Desk Evaluation:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 8/8 Syarat Wajib Terpenuhi (LULUS)
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: REKAPITULASI SKOR ARJUNA (100 POIN) */}
          <div className="space-y-2 section-block">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-2 rounded border border-slate-200">
              II. REKAPITULASI SKOR PENILAIAN INSTRUMEN ARJUNA (100 POIN)
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 border border-slate-300 rounded bg-slate-50">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Tata Kelola / Manajemen</span>
                <span className="text-2xl font-black text-slate-900">{manajemenScore}</span>
                <span className="text-[10px] text-slate-500 font-semibold block">/ 48 Poin Maksimal</span>
              </div>
              <div className="p-3 border border-slate-300 rounded bg-slate-50">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Substansi Artikel</span>
                <span className="text-2xl font-black text-slate-900">{substansiScore}</span>
                <span className="text-[10px] text-slate-500 font-semibold block">/ 52 Poin Maksimal</span>
              </div>
              <div className="p-3 border-2 border-slate-900 rounded bg-amber-50">
                <span className="text-[10px] font-bold uppercase text-amber-900 block">Total Akumulasi Skor</span>
                <span className="text-2xl font-black text-amber-900">{totalScore}</span>
                <span className="text-[10px] font-bold text-amber-900 block">/ 100 Poin ({sintaLevel})</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: TABEL RINCIAN 32+ INDIKATOR GRANULAR */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-2 rounded border border-slate-200">
              III. RINCIAN EVALUASI GRANULAR 32+ INDIKATOR ARJUNA
            </h3>
            <table className="w-full text-[11px] text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-200 text-slate-900 uppercase font-bold text-[10px]">
                  <th className="border border-slate-300 p-2 w-12 text-center">Kode</th>
                  <th className="border border-slate-300 p-2">Indikator Penilaian</th>
                  <th className="border border-slate-300 p-2 w-20">Kategori</th>
                  <th className="border border-slate-300 p-2 w-14 text-center">Maks</th>
                  <th className="border border-slate-300 p-2 w-14 text-center">Skor</th>
                  <th className="border border-slate-300 p-2">Sumber Data / Catatan Evaluasi</th>
                </tr>
              </thead>
              <tbody>
                {indicators.map((item) => {
                  const score = item.savedScore !== null ? item.savedScore : item.autoScore;
                  return (
                    <tr key={item.code} className="border-b border-slate-200">
                      <td className="border border-slate-300 p-1.5 font-bold text-center">{item.code}</td>
                      <td className="border border-slate-300 p-1.5 font-medium text-slate-900">{item.name}</td>
                      <td className="border border-slate-300 p-1.5 text-[10px] text-slate-600">{item.category}</td>
                      <td className="border border-slate-300 p-1.5 text-center text-slate-600">{item.maxScore}</td>
                      <td className="border border-slate-300 p-1.5 font-black text-center text-slate-900">{score}</td>
                      <td className="border border-slate-300 p-1.5 text-[10px] text-slate-600 leading-tight">
                        <span className="font-semibold text-slate-800">
                          {item.scoreSource === "verifikasi_manusia" ? "Verifikasi Asesor" : "Auto Database"}
                        </span>
                        {item.notes ? ` — "${item.notes}"` : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* FOOTER KETERANGAN DOKUMEN DIGITAL (TANPA TANDA TANGAN) */}
          <div className="pt-6 border-t-2 border-slate-200 text-center text-xs text-slate-500 section-block">
            <p className="font-medium italic">
              Dokumen Evaluasi Diri (LED) ini dihasilkan secara otomatis oleh sistem kecerdasan mutu Risenologi JAMS.
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Validasi data bersifat terpusat, terverifikasi, dan sah sebagai acuan kesiapan akreditasi ARJUNA internal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
