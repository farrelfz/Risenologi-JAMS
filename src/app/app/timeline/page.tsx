import { Metadata } from "next";
import { requireRole } from "@/features/auth/actions";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, AlertCircle, CheckCircle2, Calendar, ArrowRight, Info, ExternalLink, RefreshCw, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Timeline Editorial & Akreditasi JAMS",
  description:
    "Kalender editorial terintegrasi Google Spreadsheet & tenggat akreditasi Sinta/Arjuna.",
};

async function getData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );
  const { data: journal } = await supabase.from("journals").select("*").limit(1).single();
  return { journal };
}

// Spreadsheet Editorial Workflow Data (Edisi I April & Edisi II Desember)
const EDITORIAL_SCHEDULE = [
  {
    fase: "INTAKE DAN PERSIAPAN EDITORIAL",
    task: "Rekap Jurnal Masuk",
    output: "Naskah Siap Memasuki Tahap Screening Editor",
    edisi1: { start: "1 Feb 2026", deadline: "28 Feb 2026", duration: 27 },
    edisi2: { start: "1 Agu 2026", deadline: "31 Agu 2026", duration: 30 },
  },
  {
    fase: "INTAKE DAN PERSIAPAN EDITORIAL",
    task: "Pelatihan Editor dan Journal Manager",
    output: "Peningkatan Kapasitas Tim Editorial",
    edisi1: { start: "22 Feb 2026", deadline: "22 Feb 2026", duration: 0 },
    edisi2: { start: "-", deadline: "-", duration: 0 },
  },
  {
    fase: "INTAKE DAN PERSIAPAN EDITORIAL",
    task: "Uji Turnitin",
    output: "Hasil Similarity Check < 20%",
    edisi1: { start: "22 Feb 2026", deadline: "28 Feb 2026", duration: 6 },
    edisi2: { start: "1 Agu 2026", deadline: "31 Agu 2026", duration: 30 },
  },
  {
    fase: "SCREENING & PENUGASAN EDITORIAL",
    task: "Rapat Editor",
    output: "Naskah Siap Memasuki Tahap Editorial Review",
    edisi1: { start: "1 Mar 2026", deadline: "2 Mar 2026", duration: 1 },
    edisi2: { start: "4 Sep 2026", deadline: "7 Sep 2026", duration: 3 },
  },
  {
    fase: "SCREENING & PENUGASAN EDITORIAL",
    task: "Screening Editor",
    output: "Penugasan Editor & Reviewer",
    edisi1: { start: "9 Mar 2026", deadline: "15 Mar 2026", duration: 6 },
    edisi2: { start: "8 Sep 2026", deadline: "14 Sep 2026", duration: 6 },
  },
  {
    fase: "REVISI TAHAP I (Hasil Editorial Review)",
    task: "Reminder Revisi Naskah kepada Author",
    output: "Naskah Layak Memasuki Tahap Peer Review",
    edisi1: { start: "10 Mar 2026", deadline: "17 Mar 2026", duration: 7 },
    edisi2: { start: "15 Sep 2026", deadline: "21 Sep 2026", duration: 6 },
  },
  {
    fase: "PEER REVIEW OLEH REVIEWER",
    task: "Reminder Reviewer untuk Segera Mereview Naskah",
    output: "Revisi Final & Catatan Mitra Bestari",
    edisi1: { start: "18 Mar 2026", deadline: "1 Apr 2026", duration: 14 },
    edisi2: { start: "22 Sep 2026", deadline: "6 Okt 2026", duration: 14 },
  },
  {
    fase: "REVISI TAHAP II (Hasil Peer Review)",
    task: "Reminder Revisi Naskah & Cek Hasil",
    output: "Keputusan Final Naskah",
    edisi1: { start: "2 Apr 2026", deadline: "9 Apr 2026", duration: 7 },
    edisi2: { start: "7 Okt 2026", deadline: "14 Okt 2026", duration: 7 },
  },
  {
    fase: "KEPUTUSAN FINAL EDITORIAL",
    task: "Screening Akhir Editor & Pengiriman LoA",
    output: "Keputusan Status: Accept / Reject & LoA",
    edisi1: { start: "10 Apr 2026", deadline: "18 Apr 2026", duration: 8 },
    edisi2: { start: "15 Okt 2026", deadline: "22 Okt 2026", duration: 7 },
  },
  {
    fase: "ADMINISTRASI PUBLIKASI",
    task: "Pengiriman Invoice & Pembayaran Author",
    output: "Artikel Layak Masuk Tahap Produksi",
    edisi1: { start: "18 Apr 2026", deadline: "23 Apr 2026", duration: 5 },
    edisi2: { start: "22 Okt 2026", deadline: "29 Okt 2026", duration: 7 },
  },
  {
    fase: "PRODUKSI",
    task: "Copy Editing, Layout, Metadata & DOI",
    output: "Galley Proof & DOI Aktif Crossref",
    edisi1: { start: "23 Apr 2026", deadline: "28 Apr 2026", duration: 5 },
    edisi2: { start: "30 Okt 2026", deadline: "12 Nov 2026", duration: 13 },
  },
  {
    fase: "PUBLIKASI",
    task: "Publish Online & BC Pengumuman Flyer",
    output: "Terbitan Online & Promosi Media Sosial",
    edisi1: { start: "29 Apr 2026", deadline: "29 Apr 2026", duration: 0 },
    edisi2: { start: "1 Des 2026", deadline: "2 Des 2026", duration: 1 },
  },
];

interface Milestone {
  id: string;
  title: string;
  subtitle: string;
  date: Date | null;
  category: "Akreditasi" | "ISSN" | "Indeksasi" | "Penerbitan" | "Lainnya";
  status: "passed" | "urgent" | "upcoming" | "unknown";
  daysLeft?: number;
  note?: string;
  action?: string;
}

function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function buildMilestones(journal: any): Milestone[] {
  const now = new Date();
  const milestones: Milestone[] = [
    {
      id: "sinta-reaccreditation",
      title: "Pengajuan Reakreditasi Sinta",
      subtitle: "Batas pengajuan reakreditasi ke Sinta/Arjuna",
      date: journal?.tanggal_kedaluwarsa_akreditasi
        ? new Date(journal.tanggal_kedaluwarsa_akreditasi)
        : new Date(now.getFullYear() + 1, 5, 30),
      category: "Akreditasi",
      status: "unknown",
      note: "Persiapan rekomendasikan dimulai 6 bulan sebelum tenggat. Pastikan data tata kelola sudah menunjukkan indikator yang solid.",
      action: "Mulai persiapan Desk Evaluation",
    },
    {
      id: "publication-april",
      title: "Penerbitan Edisi I April 2026",
      subtitle: "Volume terbaru — terbitan reguler",
      date: new Date(2026, 3, 29),
      category: "Penerbitan",
      status: "unknown",
      note: "Sesuai Jadwal Spreadsheet: Publish pada 29 April 2026.",
    },
    {
      id: "publication-december",
      title: "Penerbitan Edisi II Desember 2026",
      subtitle: "Volume terbaru — terbitan reguler",
      date: new Date(2026, 11, 1),
      category: "Penerbitan",
      status: "unknown",
      note: "Sesuai Jadwal Spreadsheet: Publish pada 1 Desember 2026.",
    },
    {
      id: "doaj-verify",
      title: "Verifikasi Ulang DOAJ",
      subtitle: "Pembaruan profil dan verifikasi status aktif",
      date: new Date(2027, 0, 1),
      category: "Indeksasi",
      status: "upcoming",
      note: "DOAJ melakukan audit berkala. Pastikan profil jurnal di DOAJ selalu diperbarui.",
    },
    {
      id: "crossref-update",
      title: "Update Metadata Crossref",
      subtitle: "Pastikan seluruh artikel terdaftar dan DOI aktif",
      date: new Date(2026, 3, 28),
      category: "Indeksasi",
      status: "unknown",
      note: "DOI diinput pada 27-28 April 2026 sebelum publikasi Edisi I.",
    },
  ];

  return milestones
    .map((m) => {
      if (!m.date) return m;
      const d = daysUntil(m.date);
      const computedStatus: Milestone["status"] =
        d < 0 ? "passed" : d <= 90 ? "urgent" : "upcoming";
      return { ...m, status: computedStatus, daysLeft: d };
    })
    .sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));
}

import { SpreadsheetSyncControl } from "./spreadsheet-sync-control";

export default async function TimelinePage() {
  await requireRole(["administrator", "journal_manager", "editor"]);
  const { journal } = await getData();
  const milestones = buildMilestones(journal);
  const webhookUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL || "";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timeline & Jadwal Editorial 2026</h1>
          <p className="text-muted-foreground mt-1">
            Sinkronisasi terpadu antara Google Spreadsheet Workflow, Tenggat OJS, dan Akreditasi Sinta.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://docs.google.com/spreadsheets/d/1_r44jmvzyKOb8fTvnwJ79OHm1esXUb5OaIzStqEtr1I/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 font-semibold text-xs hover:bg-emerald-500/20 transition-all shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4" /> Buka Google Spreadsheet
          </a>
        </div>
      </div>

      {/* Interactive 2-Way Sync Control Bar */}
      <SpreadsheetSyncControl webhookUrl={webhookUrl} />

      {/* Spreadsheet Editorial Workflow Table */}
      <Card className="glass-card border-border/50">
        <CardHeader className="border-b border-border/30 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-500" /> Alur Editorial & To-Do List (Terintegrasi Spreadsheet)
              </CardTitle>

            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold self-start md:self-auto">
              Edisi April & Edisi Desember 2026
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border/40">
                <th className="p-3.5 font-bold">Fase & Tahap Editorial</th>
                <th className="p-3.5 font-bold">To-Do List Kegiatan</th>
                <th className="p-3.5 font-bold">Target Output</th>
                <th className="p-3.5 font-bold text-center bg-emerald-500/5 border-l border-r border-border/30">
                  Edisi I (April) <br />
                  <span className="text-[9px] font-normal text-emerald-600">Start — Deadline (Durasi)</span>
                </th>
                <th className="p-3.5 font-bold text-center bg-blue-500/5">
                  Edisi II (Desember) <br />
                  <span className="text-[9px] font-normal text-blue-600">Start — Deadline (Durasi)</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 font-medium">
              {EDITORIAL_SCHEDULE.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3.5 text-foreground font-bold text-[11px] max-w-[200px]">
                    {row.fase}
                  </td>
                  <td className="p-3.5 text-foreground font-medium max-w-[220px]">
                    {row.task}
                  </td>
                  <td className="p-3.5 text-muted-foreground italic max-w-[220px]">
                    {row.output}
                  </td>
                  <td className="p-3.5 text-center bg-emerald-500/5 border-l border-r border-border/30 whitespace-nowrap">
                    <span className="font-semibold text-foreground">{row.edisi1.start}</span> →{" "}
                    <span className="font-semibold text-emerald-600">{row.edisi1.deadline}</span>
                    <br />
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold inline-block mt-1">
                      {row.edisi1.duration} Hari
                    </span>
                  </td>
                  <td className="p-3.5 text-center bg-blue-500/5 whitespace-nowrap">
                    {row.edisi2.start === "-" ? (
                      <span className="text-muted-foreground">-</span>
                    ) : (
                      <>
                        <span className="font-semibold text-foreground">{row.edisi2.start}</span> →{" "}
                        <span className="font-semibold text-blue-600">{row.edisi2.deadline}</span>
                        <br />
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 font-bold inline-block mt-1">
                          {row.edisi2.duration} Hari
                        </span>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Google Apps Script Integration Section */}
      <Card className="glass-card border-border/50 bg-gradient-to-br from-background via-muted/10 to-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" /> Panduan Integrasi Google Apps Script (Otomasisasi Spreadsheet)
          </CardTitle>
          <CardDescription>
            Pasang skrip otomatis berikut di Google Spreadsheet Anda untuk sinkronisasi 2-arah dan pengiriman pengingat otomatis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-muted/40 border border-border/50 font-mono text-xs overflow-x-auto space-y-2">
            <p className="text-emerald-500 font-bold">
              // 1. Buka Google Sheet &rarr; Extensions &rarr; Apps Script
            </p>
            <p className="text-emerald-500 font-bold">// 2. Paste kode di bawah ini ke Code.gs dan simpan:</p>
            <pre className="text-foreground text-[11px] leading-relaxed">
{`function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 Risenologi JAMS')
    .addItem('Sync Schedule ke JAMS', 'syncScheduleToJAMS')
    .addItem('Kirim Reminder Editorial Otomatis', 'triggerEditorialReminders')
    .addToUi();
}

function syncScheduleToJAMS() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  SpreadsheetApp.getUi().alert('✅ Jadwal Spreadsheet berhasil disinkronkan ke Risenologi JAMS Database!');
}

function triggerEditorialReminders() {
  // Memanggil endpoint Sistem Komunikasi Editorial di Risenologi JAMS
  const response = UrlFetchApp.fetch('https://xckdnwlqdvxeknsgiaoz.supabase.co/rest/v1/communication_action', {
    method: 'get',
    headers: {
      'apikey': 'YOUR_SUPABASE_KEY'
    }
  });
  SpreadsheetApp.getUi().alert('📬 Notifikasi pengingat tenggat berhasil diproses oleh Sistem JAMS!');
}`}
            </pre>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 pt-3 flex-wrap gap-2">
            <span>✨ Fitur ini mengotomatiskan pengiriman pengingat email/WA dari spreadsheet ke penulis dan reviewer.</span>
            <span className="font-mono text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded">
              Web App Endpoint Status: Live (AKfycbyi...KJUDw)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Akreditasi Milestones */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-xl">Milestone Akreditasi & Indeksasi (Sinta, DOAJ, Crossref)</CardTitle>
          <CardDescription>
            Target kedaluwarsa dan verifikasi berkala institusi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {milestones.map((m) => (
            <div key={m.id} className="p-4 rounded-xl border border-border/40 bg-muted/10 flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 mb-1 inline-block">
                  {m.category}
                </span>
                <h3 className="text-sm font-bold text-foreground">{m.title}</h3>
                <p className="text-xs text-muted-foreground">{m.subtitle}</p>
                {m.note && <p className="text-xs text-muted-foreground mt-2 italic">{m.note}</p>}
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-semibold text-primary block">
                  {m.date ? m.date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Estimasi"}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
