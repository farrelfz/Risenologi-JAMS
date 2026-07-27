"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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
  ArrowRight,
  ExternalLink,
  Layers,
  Award,
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
  targetRoute: string;
  targetActionText: string;
}

const RUBRIC_DATA: RubricItem[] = [
  // ── Administratif ──────────────────────────────────────────────────
  {
    code: "DE-01",
    category: "Administratif",
    group: "Gerbang Evaluasi",
    name: "Desk Evaluation (8 Syarat Mutlak)",
    maxScore: "Prasyarat Wajib",
    targetCriteria:
      "Memenuhi 8/8 syarat: ISSN valid, URL aktif, Etika COPE, Akun Demo, Minimal 5 artikel PDF/edisi, Terbit rutin.",
    partialCriteria: "Kurang dari 8 syarat terpenuhi.",
    minimalCriteria: "Tidak memenuhi syarat dasar.",
    dataSource: "Checklist Kelayakan Desk Evaluation",
    tips: "Gagal 1 syarat saja menyebabkan jurnal GUGUR otomatis di meja sekretariat sebelum dinilai asesor.",
    targetRoute: "/app/desk-evaluation",
    targetActionText: "Kelola Checklist Desk Evaluation",
  },

  // ── Management (48 Poin) ────────────────────────────────────────────
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
    targetRoute: "/app/settings",
    targetActionText: "Verifikasi Profil & Scope Jurnal",
  },
  {
    code: "2 / B",
    category: "Management",
    group: "B. Kelembagaan Penerbit",
    name: "Kelembagaan Penerbit",
    maxScore: 4.0,
    targetCriteria: "Organisasi Profesi / Perguruan Tinggi bekerjasama dengan Organisasi Profesi.",
    partialCriteria: "Fakultas / Jurusan / Lembaga Penelitian Perguruan Tinggi (3.0 poin).",
    minimalCriteria: "Penerbitan mandiri atau perorangan (1.0 poin).",
    dataSource: "Profil Kelembagaan Penerbit & Dokumen Kerjasama",
    tips: "Tambahkan MoU kerjasama dengan Organisasi Keilmuan/Profesi untuk menaikkan skor dari 3.0 ke 4.0 Poin penuh.",
    targetRoute: "/app/settings",
    targetActionText: "Verifikasi Kelembagaan & MoU Kerjasama",
  },
  {
    code: "3A",
    category: "Management",
    group: "C. Manajemen Penyuntingan",
    name: "Mitra Bestari (Reviewer Diversity)",
    maxScore: 6.0,
    targetCriteria: "Reviewer berasal dari ≥4 negara & >50% berkualifikasi internasional.",
    partialCriteria: "Reviewer berasal dari ≥2 negara (4.0 poin) atau rasio internasional 25-50%.",
    minimalCriteria: "Reviewer berasal dari 1 negara / domestik saja (2.0 poin).",
    dataSource: "Register Mitra Bestari JAMS",
    tips: "Pengungkit skor tertinggi di kelompok C! Rekrut minimal 4 reviewer dari negara berbeda dengan Scopus ID/ORCID terverifikasi.",
    targetRoute: "/app/registry/reviewers",
    targetActionText: "Kelola Registri Reviewer",
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
    tips: "Undang akademisi luar negeri menjadi Editorial Board dan sertakan rekam jejak Scopus ID / Google Scholar 5 tahun terakhir.",
    targetRoute: "/app/registry/editors",
    targetActionText: "Kelola Dewan Penyunting",
  },
  {
    code: "3C",
    category: "Management",
    group: "C. Manajemen Penyuntingan",
    name: "Mutu Penyuntingan (Review Substantif)",
    maxScore: 3.0,
    targetCriteria:
      "Terdapat catatan review substantif mendalam (novelty, metodologi & pembahasan) yang tersimpan di sistem.",
    partialCriteria: "Review ada tetapi bersifat minor/editorial saja (1.5 poin).",
    minimalCriteria: "Tidak ada bukti review substantif (0 poin).",
    dataSource: "Catatan Penilaian Substantif Naskah",
    tips: "Pastikan reviewer mengisi form/catatan komentar substantif di OJS, lalu simpan buktinya di sistem JAMS.",
    targetRoute: "/app/manuscripts",
    targetActionText: "Evaluasi Catatan Review Naskah",
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
    targetRoute: "/app/rubric-reference",
    targetActionText: "Lihat Template & Petunjuk Penulis",
  },
  {
    code: "3E",
    category: "Management",
    group: "C. Manajemen Penyuntingan",
    name: "Mutu Gaya & Format Selingkung",
    maxScore: 2.0,
    targetCriteria:
      "Konsisten 100% pada struktur artikel, gaya sitasi (APA/IEEE), rumus, tabel, dan gambar.",
    partialCriteria: "Cukup konsisten tetapi ada variasi format antar-artikel (1.0 poin).",
    minimalCriteria: "Format dan gaya selingkung tidak konsisten.",
    dataSource: "Audit Konsistensi Gaya Selingkung & PDF",
    tips: "Gunakan template tata letak yang ketat pada saat proses copyediting sebelum publish.",
    targetRoute: "/app/manuscripts",
    targetActionText: "Periksa Format Layout Naskah",
  },
  {
    code: "3F",
    category: "Management",
    group: "C. Manajemen Penyuntingan",
    name: "Manajemen Online Daring (OJS)",
    maxScore: 2.0,
    targetCriteria:
      "Menggunakan Open Journal System (OJS) secara penuh untuk seluruh alur penaskahan (Submission -> Review -> Publishing).",
    partialCriteria: "Menggunakan web statis / hybrid email (1.0 poin).",
    minimalCriteria: "Penerbitan cetak saja / tanpa web.",
    dataSource: "Audit Integrasi Platform OJS 3",
    tips: "OJS 3.3.0.19 yang aktif memberikan skor penuh 2.0 secara otomatis.",
    targetRoute: "/app/desk-evaluation",
    targetActionText: "Verifikasi Alur Kerja OJS",
  },
  {
    code: "G1-G10",
    category: "Management",
    group: "G. Penampilan & Keberkalaan",
    name: "Penampilan & Keberkalaan (10 Indikator)",
    maxScore: 11.0,
    targetCriteria:
      "Terbit rutin tepat waktu (2x/tahun: April & Desember), bidang cetak konsisten, tipografi rapi, desain web profesional.",
    partialCriteria: "Ada keterlambatan terbit atau variasi tipografi/halaman (6.0 - 9.0 poin).",
    minimalCriteria: "Keterlambatan kronis atau tampilan web tidak rapi.",
    dataSource: "Arsip Edisi Terbitan & Audit Tata Letak PDF",
    tips: "Pastikan jadwal terbit konsisten dan terbit minimal 5 artikel per nomor (target ≥100 hlm/volume).",
    targetRoute: "/app/timeline",
    targetActionText: "Kelola Edisi & Linimasa",
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
    targetRoute: "/app/intelligence",
    targetActionText: "Cek Intelijen Visitor Counter",
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
    targetRoute: "/app/internationalization",
    targetActionText: "Cek Portal Indeksasi DOAJ",
  },
  {
    code: "8C",
    category: "Management",
    group: "H. Penyebarluasan",
    name: "Identitas Unik Artikel (DOI Crossref)",
    maxScore: 1.0,
    targetCriteria: "100% artikel di seluruh edisi memiliki DOI aktif dari Crossref.",
    partialCriteria: ">50% artikel memiliki DOI (0.5 poin).",
    minimalCriteria: "Belum terdaftar DOI Crossref (0 poin).",
    dataSource: "Registri DOI Resmi Crossref Indonesia",
    tips: "Daftar ke Crossref Indonesia (RJIF/Relawan Jurnal Indonesia) untuk mendapatkan alokasi DOI batch.",
    targetRoute: "/app/intelligence",
    targetActionText: "Verifikasi Pendaftaran DOI Crossref",
  },

  // ── Substance (52 Poin) ─────────────────────────────────────────────
  {
    code: "4A",
    category: "Substance",
    group: "Substansi Artikel",
    name: "Cakupan Keilmuan (Focus & Scope)",
    maxScore: 4.0,
    targetCriteria: "Fokus keilmuan sangat spesifik & mendalam sesuai jangkauan yang didaftarkan.",
    partialCriteria: "Keilmuan agak luas / bersifat interdisiplin (2.0 poin).",
    minimalCriteria: "Keilmuan tidak jelas / terlalu umum.",
    dataSource: "Evaluasi Fokus & Jangkauan Keilmuan (Focus & Scope)",
    tips: "Tolak naskah di luar focus & scope sebelum dikirim ke reviewer untuk menjaga konsistensi keilmuan.",
    targetRoute: "/app/manuscripts",
    targetActionText: "Verifikasi Scope Naskah",
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
    targetRoute: "/app/internationalization",
    targetActionText: "Analisis Sebaran Negara Penulis",
  },
  {
    code: "4C",
    category: "Substance",
    group: "Substansi Artikel",
    name: "Dampak Ilmiah (Sitasi Dimensions/Scholar)",
    maxScore: 8.0,
    targetCriteria:
      "Tingkat sitasi tinggi pada artikel lain di jurnal bereputasi Sinta 1-2 / Scopus (>30 sitasi).",
    partialCriteria: "Sitasi sedang di Google Scholar & Garuda (4.0 poin).",
    minimalCriteria: "Sedikit atau belum ada sitasi (0 - 2.0 poin).",
    dataSource: "Pelacakan Sitasi & Referensi Crossref / Scholar",
    tips: "Pastikan artikel mudah ditemukan di Google Scholar & terdaftar di Crossref agar mudah disitasi.",
    targetRoute: "/app/intelligence",
    targetActionText: "Lacak Sitasi via Crossref API",
  },
  {
    code: "4D-4N",
    category: "Substance",
    group: "Substansi Per-Artikel",
    name: "Substansi Per-Artikel (Novelty & Referensi Primer)",
    maxScore: 21.0,
    targetCriteria:
      "Judul/Abstrak (4), Metodologi (4), Novelty (6), Kontribusi (4), Referensi Primer >80% (3), & Kemutakhiran ≤10th (3).",
    partialCriteria: "Sebagian komponen terpenuhi di rata-rata artikel.",
    minimalCriteria: "Kualitas artikel bervariasi atau kurang dari standar.",
    dataSource: "Evaluasi Mutu Naskah & Pustaka Primer",
    tips: "Evaluasi mutu per naskah menggunakan form editor JAMS yang langsung diagregasikan ke 21 poin ini.",
    targetRoute: "/app/manuscripts",
    targetActionText: "Evaluasi Form Substansi Per-Naskah",
  },
  {
    code: "5A-5G",
    category: "Substance",
    group: "Gaya Penulisan",
    name: "Gaya Penulisan, IMRaD & Mendeley/Zotero",
    maxScore: 11.0,
    targetCriteria:
      "Struktur IMRaD terstandar, abstrak bilingual, sitasi konsisten APA/IEEE, dan penggunaan Reference Manager.",
    partialCriteria: "Sebagian naskah belum menggunakan Mendeley/Zotero.",
    minimalCriteria: "Gaya penulisan dan sitasi belum konsisten.",
    dataSource: "Audit Gaya Selingkung & Reference Manager",
    tips: "Wajibkan penulis mengunggah file sitasi Mendeley/Zotero (.bib/.ris) saat submit.",
    targetRoute: "/app/manuscripts",
    targetActionText: "Cek Referensi & Reference Manager",
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
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/30 border border-border/40">
          <Button
            variant={categoryFilter === "All" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCategoryFilter("All")}
            className="text-xs h-8 rounded-lg"
          >
            Semua Kelompok
          </Button>
          <Button
            variant={categoryFilter === "Administratif" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCategoryFilter("Administratif")}
            className="text-xs h-8 rounded-lg"
          >
            Administratif
          </Button>
          <Button
            variant={categoryFilter === "Management" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCategoryFilter("Management")}
            className="text-xs h-8 rounded-lg"
          >
            Management (48 Poin)
          </Button>
          <Button
            variant={categoryFilter === "Substance" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCategoryFilter("Substance")}
            className="text-xs h-8 rounded-lg"
          >
            Substance (52 Poin)
          </Button>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari indikator atau kata kunci..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-background/50 border-border/50"
          />
        </div>
      </div>

      {/* Rubric Cards List */}
      <div className="grid gap-4">
        {filteredData.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-xl bg-muted/10">
            <p className="text-muted-foreground">Tidak ada kriteria rubrik yang sesuai pencarian.</p>
          </div>
        ) : (
          filteredData.map((item) => {
            const isExpanded = expandedCode === item.code;
            return (
              <Card
                key={item.code}
                className="glass-card border-border/50 hover:border-primary/40 transition-all duration-300 shadow-sm"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          Kode: {item.code}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {item.group}
                        </span>
                      </div>
                      <CardTitle className="text-lg font-bold text-foreground">
                        {item.name}
                      </CardTitle>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block">Skor Maksimal</span>
                        <span className="text-lg font-black text-foreground">{item.maxScore}</span>
                      </div>

                      {/* Direct Verification Link to Target JAMS Section */}
                      <Link href={item.targetRoute}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                        >
                          <span>{item.targetActionText}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleExpand(item.code)}
                        className="h-8 w-8 text-muted-foreground"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-2 space-y-4">
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                      🎯 Kriteria Target (Skor Maksimal):
                    </span>
                    <p className="text-foreground leading-relaxed">{item.targetCriteria}</p>
                  </div>

                  {isExpanded && (
                    <div className="space-y-3 pt-2 animate-in-fade">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                          <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">
                            ⚠️ Kriteria Parsial:
                          </span>
                          <p className="text-foreground leading-relaxed">{item.partialCriteria}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                          <span className="font-bold text-red-600 dark:text-red-400 block mb-1">
                            ❌ Kriteria Minimal / Gagal:
                          </span>
                          <p className="text-foreground leading-relaxed">{item.minimalCriteria}</p>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pt-3 border-t border-border/20 text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="font-semibold text-foreground">Sumber Data di JAMS:</span>
                          <span className="font-medium text-foreground">{item.dataSource}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-primary font-semibold">
                          <Sparkles className="h-3.5 w-3.5 shrink-0" />
                          <span>Tips AI: {item.tips}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
