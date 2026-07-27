"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Info,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Filter,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface RubricItem {
  code: string;
  category: "Management" | "Substance" | "Administratif";
  group: string;
  name: string;
  maxScore: number | string;
  targetCriteria: string;
  partialCriteria: string;
  minimalCriteria: string;
  dataSource: string;
  tips: string;
}

const RUBRIC_DATA: RubricItem[] = [
  // ── Administratif ──────────────────────────────────────────────────
  {
    code: "M1 / DE",
    category: "Administratif",
    group: "Gerbang Evaluasi",
    name: "Desk Evaluation (8 Syarat Wajib)",
    maxScore: "Prasyarat Wajib",
    targetCriteria:
      "Memenuhi 8/8 syarat: ISSN valid, URL aktif, Etika COPE, Akun Demo, Minimal 5 artikel PDF/edisi, Terbit rutin.",
    partialCriteria: "Kurang dari 8 syarat terpenuhi.",
    minimalCriteria: "Tidak memenuhi syarat dasar.",
    dataSource: "Desk Evaluation Checklist (`desk_evaluation_checks`)",
    tips: "Gagal 1 syarat saja menyebabkan jurnal GUGUR otomatis di meja sekretariat sebelum dinilai asesor.",
  },

  // ── Management (49 Poin) ────────────────────────────────────────────
  {
    code: "1 / A",
    category: "Management",
    group: "A. Penamaan Jurnal",
    name: "Penamaan Jurnal",
    maxScore: 2.0,
    targetCriteria: "Spesifik & konsisten dengan cabang keilmuan yang diusung.",
    partialCriteria: "Nama terlalu umum atau bersifat multidisiplin luas.",
    minimalCriteria: "Nama tidak menggambarkan keilmuan.",
    dataSource: "Profil JAMS & Portal ISSN BRIN",
    tips: "Jurnal dengan nama spesifik cabang ilmu mendapat skor 2.0 penuh dibanding nama multidisiplin (1.0).",
  },
  {
    code: "2 / B",
    category: "Management",
    group: "B. Kelembagaan Penerbit",
    name: "Kelembagaan Penerbit",
    maxScore: 5.0,
    targetCriteria: "Organisasi Profesi / Perguruan Tinggi bekerjasama dengan Organisasi Profesi.",
    partialCriteria: "Fakultas / Jurusan / Lembaga Penelitian Perguruan Tinggi (3.0 poin).",
    minimalCriteria: "Penerbitan mandiri atau perorangan (1.0 poin).",
    dataSource: "Profil Kelembagaan Penerbit & Dokumen Kerjasama",
    tips: "Tambahkan MoU kerjasama dengan Organisasi Keilmuan/Profesi untuk menaikkan skor dari 3.0 ke 5.0.",
  },
  {
    code: "3A",
    category: "Management",
    group: "C. Manajemen Penyuntingan",
    name: "Mitra Bestari (Reviewer)",
    maxScore: 6.0,
    targetCriteria: "Reviewer berasal dari ≥4 negara & >50% berkualifikasi internasional.",
    partialCriteria: "Reviewer berasal dari ≥2 negara (4.0 poin) atau rasio internasional 25-50%.",
    minimalCriteria: "Reviewer berasal dari 1 negara / domestik saja (2.0 poin).",
    dataSource: "Register Mitra Bestari JAMS",
    tips: "Pengungkit skor tertinggi di kelompok C! Rekrut minimal 4 reviewer dari negara berbeda dengan Scopus ID/ORCID terverifikasi.",
  },
  {
    code: "3B",
    category: "Management",
    group: "C. Manajemen Penyuntingan",
    name: "Dewan Penyunting (Editorial Board)",
    maxScore: 5.0,
    targetCriteria: "Editor berasal dari ≥4 negara & >50% berkualifikasi internasional.",
    partialCriteria: "Editor berasal dari ≥2 negara (3.0 poin).",
    minimalCriteria: "Editor berasal dari 1 negara saja (1.0 poin).",
    dataSource: "Register Dewan Penyunting JAMS",
    tips: "Undang akademisi luar negeri menjadi Editorial Board untuk menaikkan skor dari 1.0 ke 5.0.",
  },
  {
    code: "3C",
    category: "Management",
    group: "C. Manajemen Penyuntingan",
    name: "Mutu Penyuntingan (Review Substantif)",
    maxScore: 3.0,
    targetCriteria:
      "Terdapat catatan review substantif mendalam (bukan kosmetik) yang tersimpan di sistem.",
    partialCriteria: "Review ada tetapi bersifat minor/editorial saja (1.5 poin).",
    minimalCriteria: "Tidak ada bukti review substantif (0 poin).",
    dataSource: "Catatan Penilaian Substantif Naskah",
    tips: "Pastikan reviewer mengisi form/catatan komentar substantif di OJS, lalu simpan buktinya di sistem.",
  },
  {
    code: "3D",
    category: "Management",
    group: "C. Manajemen Penyuntingan",
    name: "Petunjuk Penulis (Author Guidelines)",
    maxScore: 1.0,
    targetCriteria:
      "Petunjuk penulis sangat jelas, sistematik, menyertakan contoh gaya selingkung & template doc/docx/latex.",
    partialCriteria: "Petunjuk penulis ada tapi kurang detail / tanpa template (0.5 poin).",
    minimalCriteria: "Petunjuk penulis tidak tersedia di web.",
    dataSource: "Verifikasi Prasyarat Administrasi ARJUNA",
    tips: "Sediakan file template (.docx & .pdf) yang dapat diunduh langsung di halaman depan OJS.",
  },
  {
    code: "3E",
    category: "Management",
    group: "C. Manajemen Penyuntingan",
    name: "Mutu Gaya & Format",
    maxScore: 2.0,
    targetCriteria:
      "Konsisten 100% pada struktur artikel, gaya sitasi (APA/IEEE), rumus, tabel, dan gambar.",
    partialCriteria: "Cukup konsisten tetapi ada variasi format antar-artikel (1.0 poin).",
    minimalCriteria: "Format dan gaya selingkung tidak konsisten.",
    dataSource: "Audit Konsistensi Gaya Selingkung & PDF",
    tips: "Gunakan template tata letak yang ketat pada saat proses copyediting sebelum publish.",
  },
  {
    code: "3F",
    category: "Management",
    group: "C. Manajemen Penyuntingan",
    name: "Manajemen Online (OJS)",
    maxScore: 2.0,
    targetCriteria:
      "Menggunakan Open Journal System (OJS) secara penuh untuk seluruh alur penaskahan.",
    partialCriteria: "Menggunakan web statis / hybrid email (1.0 poin).",
    minimalCriteria: "Penerbitan cetak saja / tanpa web.",
    dataSource: "Audit Integrasi Platform OJS 3",
    tips: "OJS 3.x yang aktif memberikan skor penuh 2.0 secara otomatis.",
  },
  {
    code: "G1-G10",
    category: "Management",
    group: "G. Penampilan & Keberkalaan",
    name: "Penampilan & Keberkalaan (10 Indikator)",
    maxScore: 11.0,
    targetCriteria:
      "Terbit rutin tepat waktu (2x/tahun), bidang cetak konsisten, tipografi rapi, desain web profesional.",
    partialCriteria: "Ada keterlambatan terbit atau variasi tipografi/halaman (6.0 - 9.0 poin).",
    minimalCriteria: "Keterlambatan kronis atau tampilan web tidak rapi.",
    dataSource: "Arsip Edisi Terbitan & Audit Tata Letak PDF",
    tips: "Pastikan jadwal terbit konsisten (misal April & Oktober) dan terbit minimal 5 artikel per nomor.",
  },
  {
    code: "8A",
    category: "Management",
    group: "H. Penyebarluasan",
    name: "Statistik Kunjungan (Visitor Counter)",
    maxScore: 3.0,
    targetCriteria:
      "Tersedia statistik kunjungan unik publik yang transparan (Flag Counter, StatCounter, Google Analytics).",
    partialCriteria: "Statistik hanya ada di internal OJS tanpa widget publik (1.5 poin).",
    minimalCriteria: "Tidak ada data statistik kunjungan.",
    dataSource: "Statistik Kunjungan Portal OJS",
    tips: "Pasang widget FlagCounter / StatCounter publik pada sidebar kanan OJS.",
  },
  {
    code: "8B",
    category: "Management",
    group: "H. Penyebarluasan",
    name: "Lembaga Pengindeks",
    maxScore: 8.0,
    targetCriteria: "Terindeks di Scopus / Web of Science (WoS) Core Collection (8.0 poin).",
    partialCriteria:
      "Terindeks di DOAJ / Copernicus / Dimensions / Crossref / Sinta / Garuda (6.0 poin).",
    minimalCriteria: "Terindeks di Google Scholar / BASE saja (3.0 poin).",
    dataSource: "Verifikasi Status Indeksasi Portal",
    tips: "Pengungkit terbesar di kelompok H! Daftarkan ke DOAJ terlebih dahulu sebagai batu loncatan menuju Scopus.",
  },
  {
    code: "8C",
    category: "Management",
    group: "H. Penyebarluasan",
    name: "Identitas Unik (DOI)",
    maxScore: 1.0,
    targetCriteria: "100% artikel di seluruh edisi memiliki DOI aktif dari Crossref.",
    partialCriteria: ">50% artikel memiliki DOI (0.5 poin).",
    minimalCriteria: "Belum terdaftar DOI Crossref (0 poin).",
    dataSource: "Registri DOI Resmi Crossref Indonesia",
    tips: "Daftar ke Crossref Indonesia (RJIF/Relawan Jurnal Indonesia) untuk mendapatkan alokasi DOI batch.",
  },

  // ── Substance (51 Poin) ─────────────────────────────────────────────
  {
    code: "4A",
    category: "Substance",
    group: "Substansi Artikel",
    name: "Cakupan Keilmuan",
    maxScore: 4.0,
    targetCriteria: "Fokus keilmuan sangat spesifik & mendalam sesuai jangkauan yang didaftarkan.",
    partialCriteria: "Keilmuan agak luas / bersifat interdisiplin (2.0 poin).",
    minimalCriteria: "Keilmuan tidak jelas / terlalu umum.",
    dataSource: "Evaluasi Fokus & Jangkauan Keilmuan (Focus & Scope)",
    tips: "Tolak naskah di luar focus & scope sebelum dikirim ke reviewer untuk menjaga konsistensi keilmuan.",
  },
  {
    code: "4B",
    category: "Substance",
    group: "Substansi Artikel",
    name: "Aspirasi Wawasan (Negara Penulis)",
    maxScore: 8.0,
    targetCriteria: "Penulis berasal dari ≥5 negara berbeda per volume terbitan.",
    partialCriteria: "Penulis berasal dari 3–4 negara (4.0 - 6.0 poin) atau 2 negara (2.0 poin).",
    minimalCriteria: "Penulis hanya berasal dari 1 negara / domestik saja (1.0 poin).",
    dataSource: "Sebaran Geografis Penulis Naskah",
    tips: "Pengungkit terbesar di kelompok Substansi! Buka Call for Paper internasional atau kolaborasi konferensi.",
  },
  {
    code: "4C",
    category: "Substance",
    group: "Substansi Artikel",
    name: "Dampak Ilmiah (Sitasi)",
    maxScore: 8.0,
    targetCriteria:
      "Tingkat sitasi tinggi pada artikel lain di jurnal bereputasi Sinta 1-2 / Scopus.",
    partialCriteria: "Sitasi sedang di Google Scholar & Garuda (4.0 poin).",
    minimalCriteria: "Sedikit atau belum ada sitasi (0 - 2.0 poin).",
    dataSource: "Pelacakan Sitasi & Referensi Crossref / Scholar",
    tips: "Pastikan artikel mudah ditemukan di Google Scholar & terdaftar di Crossref agar mudah disitasi.",
  },
  {
    code: "4D-4N",
    category: "Substance",
    group: "Substansi Per-Artikel",
    name: "Substansi Per-Artikel (11 Komponen)",
    maxScore: 31.0,
    targetCriteria:
      "Judul/Abstrak (4), Kata Kunci (1), Metodologi (4), Bahasa (3), Novelty (6), Kontribusi (4), Referensi Primer >85% (4), Analisis & Simpulan (5).",
    partialCriteria: "Sebagian komponen terpenuhi di rata-rata artikel.",
    minimalCriteria: "Kualitas artikel bervariasi atau kurang dari standar.",
    dataSource: "Evaluasi Mutu Naskah & Pustaka Primer",
    tips: "Evaluasi mutu per naskah memberikan skor 0-100 per artikel yang langsung diagregasikan ke 31 poin ini.",
  },
];

export function RubricClient() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    "All" | "Management" | "Substance" | "Administratif"
  >("All");
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  const filteredData = RUBRIC_DATA.filter((item) => {
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    const matchesSearch =
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.group.toLowerCase().includes(search.toLowerCase()) ||
      item.targetCriteria.toLowerCase().includes(search.toLowerCase()) ||
      item.tips.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (code: string) => {
    setExpandedCode(expandedCode === code ? null : code);
  };

  return (
    <div className="space-y-6">
      {/* Compact High-Density Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card border border-border/50 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Total Skor Rubrik</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-foreground">100</span>
              <span className="text-[11px] text-muted-foreground font-normal">poin</span>
            </div>
          </div>
        </div>

        <div className="glass-card border border-border/50 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
            <Filter className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Manajemen (48 Poin)</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-blue-500">48</span>
              <span className="text-[11px] text-muted-foreground font-normal">
                poin (Unsur I–III, VI–VIII)
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card border border-border/50 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Substansi (52 Poin)</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-purple-500">52</span>
              <span className="text-[11px] text-muted-foreground font-normal">poin (Unsur IV & V)</span>
            </div>
          </div>
        </div>

        <div className="glass-card border border-border/50 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Gerbang Evaluasi</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-emerald-500">8</span>
              <span className="text-[11px] text-muted-foreground font-normal">syarat wajib</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="glass-card border-border/50">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kode (3A, 4B, 8B), indikator, atau kata kunci..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 bg-muted/30 p-1 rounded-xl border border-border/40 w-full md:w-auto overflow-x-auto">
            {(["All", "Management", "Substance", "Administratif"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap",
                  categoryFilter === cat
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {cat === "All"
                  ? "Semua (100 Poin)"
                  : cat === "Management"
                    ? "Management (49)"
                    : cat === "Substance"
                      ? "Substance (51)"
                      : "Prasyarat"}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rubric Table */}
      <Card className="glass-card border-border/50 overflow-hidden">
        <CardHeader className="border-b border-border/30 bg-muted/10">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-bold">
                Daftar Lengkap Indikator Rubrik Akreditasi
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Menampilkan {filteredData.length} dari {RUBRIC_DATA.length} indikator. Klik pada
                baris untuk melihat kriteria detail & tips peningkatan skor.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/30">
            {filteredData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Tidak ada indikator yang cocok dengan pencarian "{search}".
              </div>
            ) : (
              filteredData.map((item) => {
                const isExpanded = expandedCode === item.code;
                return (
                  <div key={item.code} className="transition-colors hover:bg-muted/10">
                    {/* Header Row */}
                    <div
                      onClick={() => toggleExpand(item.code)}
                      className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-black shrink-0 tracking-wider border",
                            item.category === "Management"
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : item.category === "Substance"
                                ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                          )}
                        >
                          {item.code}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-foreground truncate">
                            {item.name}
                          </h3>
                          <p className="text-[11px] text-muted-foreground truncate">{item.group}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <span className="text-sm font-bold text-foreground">
                            {typeof item.maxScore === "number"
                              ? `${item.maxScore} Poin`
                              : item.maxScore}
                          </span>
                          <span className="block text-[10px] text-muted-foreground font-medium">
                            {item.category}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 bg-muted/20 border-t border-border/20 space-y-3 text-xs animate-in-fade">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 space-y-1">
                            <span className="font-semibold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Skor Penuh / Maksimal
                            </span>
                            <p className="text-muted-foreground leading-relaxed">
                              {item.targetCriteria}
                            </p>
                          </div>

                          <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-1">
                            <span className="font-semibold text-amber-600 flex items-center gap-1">
                              <Info className="h-3.5 w-3.5" /> Skor Menengah / Parsial
                            </span>
                            <p className="text-muted-foreground leading-relaxed">
                              {item.partialCriteria}
                            </p>
                          </div>

                          <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 space-y-1">
                            <span className="font-semibold text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5" /> Skor Minimal / Kurang
                            </span>
                            <p className="text-muted-foreground leading-relaxed">
                              {item.minimalCriteria}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between gap-3 pt-2 border-t border-border/20">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              Sumber Data di JAMS:
                            </span>
                            <code>{item.dataSource}</code>
                          </div>
                          <div className="flex items-center gap-2 text-primary font-medium">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Tips AI: {item.tips}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
