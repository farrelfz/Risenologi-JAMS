import { Metadata } from "next";
import { requireRole } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { IndicatorInteractiveList, GranularIndicatorItem } from "./indicator-interactive-list";

export const metadata: Metadata = {
  title: "Rincian Indikator Akreditasi (100 Poin Instrument ARJUNA)",
  description: "Rincian skor terhitung real-time per sub-indikator akreditasi Jurnal Risenologi.",
};

async function getGranularIndicatorData(journalId: string) {
  const supabase = await createClient();

  const [
    { data: journal },
    { data: reviewers },
    { data: editorialBoard },
    { data: editions },
    { data: articles },
    { data: articleAuthors },
    { data: articleReferences },
    { data: articleCitations },
    { data: siteVisits },
    { data: savedScores },
  ] = await Promise.all([
    supabase.from("journals").select("*").eq("id", journalId).single(),
    supabase.from("reviewers").select("*").eq("journal_id", journalId),
    supabase.from("editorial_board_members").select("*").eq("journal_id", journalId),
    supabase.from("editions").select("*").eq("journal_id", journalId),
    supabase.from("articles").select("*"),
    supabase.from("article_authors").select("*"),
    supabase.from("article_references").select("*"),
    supabase.from("article_citations").select("*"),
    supabase.from("site_visits").select("*").eq("journal_id", journalId),
    supabase.from("score_estimates").select("*").eq("entitas_id", journalId),
  ]);

  const allReviewers = reviewers || [];
  const allEdBoard = editorialBoard || [];
  const allArticles = articles || [];
  const allEditions = editions || [];
  const allAuthors = articleAuthors || [];
  const allReferences = articleReferences || [];
  const allCitations = articleCitations || [];
  const allVisits = siteVisits || [];
  const scoresMap = new Map<string, { skor: number; catatan?: string }>();

  if (savedScores) {
    savedScores.forEach((s: any) => {
      scoresMap.set(s.indikator_kode, { skor: Number(s.skor), catatan: s.catatan });
    });
  }

  // ── Auto Calculations ──────────────────────────────────────────────
  // 3A. Reviewer stats
  const intlReviewers = allReviewers.filter(
    (r: any) => r.kualifikasi_internasional || (r.negara && r.negara !== "Indonesia" && r.negara !== "ID"),
  ).length;
  const reviewerCountries = Array.from(new Set(allReviewers.map((r: any) => r.negara).filter(Boolean)));
  const reviewerIntlRatio = allReviewers.length > 0 ? intlReviewers / allReviewers.length : 0;
  const autoScore3A =
    reviewerCountries.length >= 4 && reviewerIntlRatio > 0.5
      ? 6.0
      : reviewerCountries.length >= 2
        ? 4.0
        : 2.0;

  // 3B. Editorial Board stats
  const edBoardCountries = Array.from(new Set(allEdBoard.map((e: any) => e.negara).filter(Boolean)));
  const edBoardIntl = allEdBoard.filter(
    (e: any) => e.kualifikasi_internasional || (e.negara && e.negara !== "Indonesia" && e.negara !== "ID"),
  ).length;
  const edBoardRatio = allEdBoard.length > 0 ? edBoardIntl / allEdBoard.length : 0;
  const autoScore3B =
    edBoardCountries.length >= 4 && edBoardRatio > 0.5 ? 5.0 : edBoardCountries.length >= 2 ? 3.0 : 1.0;

  // 4B. Author Countries
  const authorCountries = Array.from(new Set(allAuthors.map((a: any) => a.negara).filter(Boolean)));
  const autoScore4B =
    authorCountries.length >= 5 ? 8.0 : authorCountries.length >= 3 ? 6.0 : authorCountries.length >= 2 ? 3.0 : 1.0;

  // 4C. Citations
  const totalCitations = allCitations.reduce((acc: number, c: any) => acc + (c.jumlah_sitasi || 0), 0);
  const autoScore4C =
    totalCitations >= 30 ? 8.0 : totalCitations >= 15 ? 6.0 : totalCitations >= 5 ? 4.0 : 2.0;

  // 4.10 & 4.11 References
  const primaryRefs = allReferences.filter(
    (r: any) => r.jenis_sumber === "jurnal" || r.jenis_sumber === "prosiding",
  ).length;
  const primaryRatio = allReferences.length > 0 ? primaryRefs / allReferences.length : 0;
  const autoScore4_10 = primaryRatio >= 0.8 ? 1.0 : primaryRatio >= 0.5 ? 0.5 : 0;

  const currentYear = new Date().getFullYear();
  const recentRefs = allReferences.filter(
    (r: any) => r.tahun_terbit && currentYear - r.tahun_terbit <= 10,
  ).length;
  const recentRatio = allReferences.length > 0 ? recentRefs / allReferences.length : 0;
  const autoScore4_11 = recentRatio >= 0.8 ? 1.0 : recentRatio >= 0.5 ? 0.5 : 0;

  // 8A. Site Visits
  const avgVisits =
    allVisits.length > 0
      ? allVisits.reduce((acc: number, v: any) => acc + (v.jumlah_unik || 0), 0) / allVisits.length
      : 25;
  const autoScore8A = avgVisits >= 50 ? 3.0 : avgVisits >= 20 ? 1.5 : 0.5;

  // 8C. DOI
  const articlesWithDoi = allArticles.filter((a: any) => a.doi && a.doi.trim().length > 0).length;
  const doiRatio = allArticles.length > 0 ? articlesWithDoi / allArticles.length : 0;
  const autoScore8C = doiRatio >= 1 ? 1.0 : doiRatio > 0.5 ? 0.5 : 0;

  // Helper builder
  const makeItem = (
    code: string,
    name: string,
    unsurTitle: string,
    category: "Substansi" | "Manajemen" | "Administratif",
    maxScore: number,
    autoScore: number,
    description: string,
    options: { label: string; score: number }[],
    dataSource: string,
    isDummyFallback: boolean = false,
  ): GranularIndicatorItem => {
    const saved = scoresMap.get(code);
    return {
      code,
      name,
      unsur: unsurTitle.split(":")[0],
      unsurTitle,
      category,
      maxScore,
      autoScore,
      savedScore: saved ? saved.skor : null,
      scoreSource: saved ? "verifikasi_manusia" : "otomatis",
      description,
      criteriaOptions: options,
      dataSource,
      isDummyFallback,
      notes: saved?.catatan,
    };
  };

  // ── GRANULAR 32+ EVALUATION ITEMS ──────────────────────────────────
  const list: GranularIndicatorItem[] = [
    // Unsur I: Penamaan Jurnal Ilmiah (Maks: 2.0 Poin)
    makeItem(
      "1.1",
      "Spesifisitas & Konsistensi Penamaan Jurnal",
      "Unsur I: Penamaan Jurnal Ilmiah (Max 2.0 Poin)",
      "Manajemen",
      2.0,
      journal?.nama ? 1.0 : 0,
      "Nama jurnal menggambarkan spesifisitas bidang keilmuan secara rinci dan konsisten.",
      [
        { label: "Spesifik & konsisten cabang keilmuan khusus (2.0 Poin)", score: 2.0 },
        { label: "Bersifat umum / multidisiplin rumpun ilmu (1.0 Poin)", score: 1.0 },
        { label: "Nama terlalu luas / tidak spesifik (0.5 Poin)", score: 0.5 },
      ],
      "Profil Jurnal (Database Risenologi JAMS)",
    ),

    // Unsur II: Kelembagaan Penerbit (Maks: 4.0 Poin)
    makeItem(
      "2.1",
      "Kualifikasi Kelembagaan & Kerjasama Organisasi Profesi",
      "Unsur II: Kelembagaan Penerbit (Max 4.0 Poin)",
      "Manajemen",
      4.0,
      3.0,
      "Penerbitan jurnal oleh Perguruan Tinggi/Lembaga Penelitian yang bekerjasama dengan Organisasi Profesi (OPI).",
      [
        { label: "Organisasi Profesi (OPI) / Perguruan Tinggi bekerjasama dengan OPI (4.0 Poin)", score: 4.0 },
        { label: "Fakultas / Jurusan / LPPM Perguruan Tinggi (3.0 Poin)", score: 3.0 },
        { label: "Unit laboratorium / Perorangan (1.0 Poin)", score: 1.0 },
      ],
      "Profil Penerbit LPPM UNJ (Database Risenologi JAMS)",
    ),

    // Unsur III: Penyuntingan & Manajemen (Maks: 24.0 Poin)
    makeItem(
      "3A",
      "Mitra Bestari (Reviewer Diversity & International Ratio)",
      "Unsur III: Penyuntingan & Manajemen (Max 24.0 Poin)",
      "Manajemen",
      6.0,
      autoScore3A,
      `Diversitas asal negara dan kualifikasi internasional reviewer (${reviewerCountries.length} negara terdaftar, ${(reviewerIntlRatio * 100).toFixed(0)}% internasional).`,
      [
        { label: "Reviewer dari ≥4 negara & >50% kualifikasi internasional (6.0 Poin)", score: 6.0 },
        { label: "Reviewer dari ≥2 negara & 25-50% internasional (4.0 Poin)", score: 4.0 },
        { label: "Reviewer dari 1 negara / domestik saja (2.0 Poin)", score: 2.0 },
      ],
      `Registri Reviewer Database (${allReviewers.length} reviewer aktif)`,
    ),

    makeItem(
      "3B",
      "Dewan Penyunting (Editorial Board Diversity & Reputation)",
      "Unsur III: Penyuntingan & Manajemen (Max 24.0 Poin)",
      "Manajemen",
      5.0,
      autoScore3B,
      `Diversitas kepakaran & asal negara Dewan Penyunting (${edBoardCountries.length} negara terdaftar).`,
      [
        { label: "Editor dari ≥4 negara & >50% berkualifikasi internasional (5.0 Poin)", score: 5.0 },
        { label: "Editor dari ≥2 negara (3.0 Poin)", score: 3.0 },
        { label: "Editor domestik dari 1 negara saja (1.0 Poin)", score: 1.0 },
      ],
      `Registri Dewan Penyunting Database (${allEdBoard.length} editor aktif)`,
    ),

    makeItem(
      "3C",
      "Mutu Penyuntingan Substantif (Reviewer Comment Log)",
      "Unsur III: Penyuntingan & Manajemen (Max 24.0 Poin)",
      "Substansi",
      3.0,
      2.0,
      "Tersedia bukti rekam jejak review substantif mendalam di OJS (bukan sekadar review minor/formatting).",
      [
        { label: "Catatan review substantif mendalam pada seluruh artikel (3.0 Poin)", score: 3.0 },
        { label: "Catatan review substantif pada sebagian artikel (2.0 Poin)", score: 2.0 },
        { label: "Review minor / perbaikan tata bahasa saja (1.0 Poin)", score: 1.0 },
      ],
      "Kartu Kesiapan Naskah & OJS Comment Log",
    ),

    makeItem(
      "3D",
      "Petunjuk Penulis & Template Selingkung (.docx/.pdf)",
      "Unsur III: Penyuntingan & Manajemen (Max 24.0 Poin)",
      "Manajemen",
      1.0,
      1.0,
      "Petunjuk penulisan sangat jelas, sistematis, menyertakan contoh dan file template yang mudah diunduh.",
      [
        { label: "Sangat jelas, menyertakan contoh gaya selingkung & template docx (1.0 Poin)", score: 1.0 },
        { label: "Petunjuk penulis kurang rinci / tanpa template (0.5 Poin)", score: 0.5 },
        { label: "Tidak tersedia petunjuk penulisan (0 Poin)", score: 0 },
      ],
      "Prasyarat Administrasi Website OJS",
    ),

    makeItem(
      "3E",
      "Mutu Gaya & Format Layout PDF Selingkung",
      "Unsur III: Penyuntingan & Manajemen (Max 24.0 Poin)",
      "Manajemen",
      2.0,
      2.0,
      "Format penulisan konsisten di seluruh artikel (running header, layout dua kolom/satu kolom, penomoran tabel/gambar).",
      [
        { label: "Sangat konsisten & profesional di setiap edisi (2.0 Poin)", score: 2.0 },
        { label: "Format cukup konsisten dengan minor variasi (1.0 Poin)", score: 1.0 },
        { label: "Format tidak seragam antar artikel (0.5 Poin)", score: 0.5 },
      ],
      "Verifikasi Layout PDF Naskah Terbit",
    ),

    makeItem(
      "3F",
      "Manajemen Daring Jurnal (OJS 3.3 Full Workflow & Ethic)",
      "Unsur III: Penyuntingan & Manajemen (Max 24.0 Poin)",
      "Manajemen",
      7.0,
      6.0,
      "Pengelolaan penerbitan secara penuh daring memanfaatkan seluruh fitur OJS (submit, review, copyediting, publishing).",
      [
        { label: "Pengelolaan daring penuh OJS 3.3 + Etika COPE + Open Access (7.0 Poin)", score: 7.0 },
        { label: "Pengelolaan daring OJS tanpa beberapa modul etika (5.0 Poin)", score: 5.0 },
        { label: "Pengelolaan semi-daring (3.0 Poin)", score: 3.0 },
      ],
      "OJS System Audit & Protocol H Check",
    ),

    // Unsur IV: Substansi Artikel (Maks: 39.0 Poin)
    makeItem(
      "4A",
      "Cakupan Keilmuan Artikel (Focus & Scope)",
      "Unsur IV: Substansi Artikel (Max 39.0 Poin)",
      "Substansi",
      4.0,
      4.0,
      "Artikel yang diterbitkan konsisten dengan spesialisasi keilmuan yang ditetapkan pada Focus & Scope jurnal.",
      [
        { label: "Sangat fokus pada spesialisasi disiplin ilmu khusus (4.0 Poin)", score: 4.0 },
        { label: "Mencakup beberapa bidang keilmuan yang saling berkaitan (3.0 Poin)", score: 3.0 },
        { label: "Cakupan terlalu luas / melenceng dari scope (1.0 Poin)", score: 1.0 },
      ],
      "Desk Evaluasi & Focus Scope Jurnal",
    ),

    makeItem(
      "4B",
      "Aspirasi Wawasan Penulis & Afiliasi Multi-Negara",
      "Unsur IV: Substansi Artikel (Max 39.0 Poin)",
      "Substansi",
      8.0,
      autoScore4B,
      `Keragaman negara dan lembaga penulis artikel (${authorCountries.length} negara terdaftar di sistem).`,
      [
        { label: "Penulis berasal dari ≥5 negara berbeda (8.0 Poin)", score: 8.0 },
        { label: "Penulis berasal dari ≥3 negara (6.0 Poin)", score: 6.0 },
        { label: "Penulis dari multi-lembaga domestik (3.0 Poin)", score: 3.0 },
        { label: "Penulis dari 1 lembaga internal saja (1.0 Poin)", score: 1.0 },
      ],
      `Registri Penulis Database (${allAuthors.length} data penulis)`,
    ),

    makeItem(
      "4C",
      "Dampak Ilmiah & Sitasi Artikel (Dimensions/Crossref)",
      "Unsur IV: Substansi Artikel (Max 39.0 Poin)",
      "Substansi",
      8.0,
      autoScore4C,
      `Jumlah sitasi kumulatif artikel yang terdeteksi di basis data pengindeks (${totalCitations} sitasi terdata).`,
      [
        { label: "Akumulasi sitasi tinggi (≥30 sitasi terindeks) (8.0 Poin)", score: 8.0 },
        { label: "Akumulasi sitasi sedang (15-29 sitasi) (6.0 Poin)", score: 6.0 },
        { label: "Akumulasi sitasi awal (5-14 sitasi) (4.0 Poin)", score: 4.0 },
        { label: "Sitasi minimal (<5 sitasi) (2.0 Poin)", score: 2.0 },
      ],
      `Article Citations Table (${allCitations.length} artikel terindeks)`,
      true, // OpenAlex/Crossref API simulated fallback
    ),

    makeItem(
      "4.4",
      "Mutu Judul Artikel (Spesifik, Informatif, Tanpa Singkatan)",
      "Unsur IV: Substansi Artikel (Max 39.0 Poin)",
      "Substansi",
      1.0,
      1.0,
      "Judul ringkas (10-15 kata), informatif, mencerminkan isi dan masalah penelitian tanpa singkatan.",
      [
        { label: "Judul sangat rinci, lugas & tanpa singkatan tidak baku (1.0 Poin)", score: 1.0 },
        { label: "Judul terlalu panjang / memuat singkatan (0.5 Poin)", score: 0.5 },
      ],
      "Evaluasi Mutu Naskah Per-Artikel",
    ),

    makeItem(
      "4.5",
      "Mutu Abstrak & Kata Kunci (Bilingual, Metodologis)",
      "Unsur IV: Substansi Artikel (Max 39.0 Poin)",
      "Substansi",
      2.0,
      1.5,
      "Abstrak bilingual (Indonesia & Inggris) yang memuat tujuan, metode, hasil utama, dan implikasi ringkas (150-250 kata).",
      [
        { label: "Abstrak bilingual lengkap dengan struktur IMRaD (2.0 Poin)", score: 2.0 },
        { label: "Abstrak bilingual tetapi kurang memuat metodologi/implikasi (1.0 Poin)", score: 1.0 },
        { label: "Abstrak satu bahasa saja (0.5 Poin)", score: 0.5 },
      ],
      "Evaluasi Abstrak Naskah Database",
    ),

    makeItem(
      "4.6",
      "Mutu Kebaruan (Novelty) & Kontribusi Kebaruan",
      "Unsur IV: Substansi Artikel (Max 39.0 Poin)",
      "Substansi",
      5.0,
      4.0,
      "Artikel memberikan kontribusi kebaruan ilmiah (novelty) yang dinyatakan tegas pada pendahuluan.",
      [
        { label: "Kebaruan sangat tinggi, terbukti dengan state-of-the-art jernih (5.0 Poin)", score: 5.0 },
        { label: "Ada kebaruan tapi pernyataan novelty kurang eksplisit (3.5 Poin)", score: 3.5 },
        { label: "Studi mengulang / konfirmasi penelitian terdahulu (2.0 Poin)", score: 2.0 },
      ],
      "Kartu Kesiapan Naskah (Protokol B)",
    ),

    makeItem(
      "4.7",
      "Rigor Metodologi & Kejelasan Instrumen Penelitian",
      "Unsur IV: Substansi Artikel (Max 39.0 Poin)",
      "Substansi",
      4.0,
      3.0,
      "Metodologi dijelaskan secara rinci sehingga memungkinkan verifikasi dan replikasi oleh peneliti lain.",
      [
        { label: "Metode & instrumen sangat rinci dan dapat direplikasi (4.0 Poin)", score: 4.0 },
        { label: "Metode dijelaskan umum tanpa rincian instrumen (2.5 Poin)", score: 2.5 },
        { label: "Metode tidak jelas / membingungkan (1.0 Poin)", score: 1.0 },
      ],
      "Kartu Kesiapan Naskah Editor",
    ),

    makeItem(
      "4.8",
      "Kedalaman Analisis & Pembahasan Hasil",
      "Unsur IV: Substansi Artikel (Max 39.0 Poin)",
      "Substansi",
      4.0,
      3.0,
      "Pembahasan membandingkan temuan dengan teori/penelitian terdahulu, bukan sekadar narasi ulang data.",
      [
        { label: "Pembahasan mendalam dikomparasi dengan rujukan primer (4.0 Poin)", score: 4.0 },
        { label: "Pembahasan memuat komparasi terbatas (2.5 Poin)", score: 2.5 },
        { label: "Pembahasan hanya mengulang angka tabel/grafik (1.0 Poin)", score: 1.0 },
      ],
      "Review Substantif Per-Artikel",
    ),

    makeItem(
      "4.9",
      "Ketepatan & Rigor Simpulan Artikel",
      "Unsur IV: Substansi Artikel (Max 39.0 Poin)",
      "Substansi",
      1.0,
      1.0,
      "Simpulan menjawab hipotesis/tujuan secara kritis, tidak sekadar mengulang bagian hasil.",
      [
        { label: "Simpulan tegas, menjawab masalah & memberi saran ilmiah (1.0 Poin)", score: 1.0 },
        { label: "Simpulan hanya mengulang kalimat ringkasan hasil (0.5 Poin)", score: 0.5 },
      ],
      "Kartu Kesiapan Naskah Editor",
    ),

    makeItem(
      "4.10",
      "Kuantitas & Mutu Referensi Primer (>85% Jurnal)",
      "Unsur IV: Substansi Artikel (Max 39.0 Poin)",
      "Substansi",
      1.0,
      autoScore4_10,
      `Proporsi rujukan primer (artikel jurnal & prosiding) terhadap total pustaka (${(primaryRatio * 100).toFixed(0)}% rujukan primer).`,
      [
        { label: "Proporsi rujukan primer ≥80% dari total daftar pustaka (1.0 Poin)", score: 1.0 },
        { label: "Proporsi rujukan primer 50-79% (0.5 Poin)", score: 0.5 },
        { label: "Proporsi rujukan primer <50% (0.2 Poin)", score: 0.2 },
      ],
      `Article References Table (${allReferences.length} pustaka terdaftar)`,
    ),

    makeItem(
      "4.11",
      "Kemutakhiran Pustaka Rujukan (10/5 Tahun Terakhir)",
      "Unsur IV: Substansi Artikel (Max 39.0 Poin)",
      "Substansi",
      1.0,
      autoScore4_11,
      `Proporsi rujukan terbit dalam 10 tahun terakhir (${(recentRatio * 100).toFixed(0)}% mutakhir).`,
      [
        { label: "Proporsi pustaka mutakhir ≥80% (1.0 Poin)", score: 1.0 },
        { label: "Proporsi pustaka mutakhir 50-79% (0.5 Poin)", score: 0.5 },
        { label: "Proporsi pustaka mutakhir <50% (0.2 Poin)", score: 0.2 },
      ],
      `Article References Table (${allReferences.length} pustaka terdaftar)`,
    ),

    // Unsur V: Gaya Penulisan (Maks: 4.0 Poin)
    makeItem(
      "5A",
      "Identitas Penulis & Afiliasi Konsisten",
      "Unsur V: Gaya Penulisan & Format (Max 4.0 Poin)",
      "Manajemen",
      1.0,
      1.0,
      "Identitas seluruh penulis ditulis lengkap (nama tanpa gelar, afiliasi lembaga, negara, dan email korespondensi).",
      [
        { label: "Identitas & afiliasi sangat lengkap & seragam (1.0 Poin)", score: 1.0 },
        { label: "Ada identitas / email korespondensi yang tidak tercantum (0.5 Poin)", score: 0.5 },
      ],
      "Metadata Artikel & Form Penulis",
    ),

    makeItem(
      "5B",
      "Sistematika Artikel & Struktur IMRaD",
      "Unsur V: Gaya Penulisan & Format (Max 4.0 Poin)",
      "Manajemen",
      1.0,
      1.0,
      "Sistematika penulisan mengikuti standar IMRaD (Introduction, Methods, Results, Discussion).",
      [
        { label: "Struktur IMRaD konsisten penuh di setiap artikel (1.0 Poin)", score: 1.0 },
        { label: "Sistematika variatif tanpa standar Baku (0.5 Poin)", score: 0.5 },
      ],
      "Format Selingkung Template Jurnal",
    ),

    makeItem(
      "5C",
      "Sistem Sitasi In-Text Standard (Mendeley/Zotero)",
      "Unsur V: Gaya Penulisan & Format (Max 4.0 Poin)",
      "Manajemen",
      1.0,
      1.0,
      "Pengutipan dalam teks menggunakan standar baku (APA 7th / IEEE) dan diolah dengan reference manager.",
      [
        { label: "Sitasi seragam mengacu standar baku dengan Reference Manager (1.0 Poin)", score: 1.0 },
        { label: "Sitasi manual dengan beberapa ketidaksesuaian format (0.5 Poin)", score: 0.5 },
      ],
      "Audit Format Referensi Artikel",
    ),

    makeItem(
      "5D",
      "Format & Kelengkapan Daftar Pustaka",
      "Unsur V: Gaya Penulisan & Format (Max 4.0 Poin)",
      "Manajemen",
      1.0,
      1.0,
      "Setiap pengutipan di teks tercantum di daftar pustaka dan sebaliknya, dilengkapi DOI jika ada.",
      [
        { label: "100% konsisten antara in-text citation & daftar pustaka + DOI (1.0 Poin)", score: 1.0 },
        { label: "Ada rujukan teks yang tidak masuk daftar pustaka (0.5 Poin)", score: 0.5 },
      ],
      "Verifikasi Daftar Pustaka Database",
    ),

    // Unsur VI: Penampilan (Maks: 7.0 Poin)
    makeItem(
      "6A",
      "Ukuran Bidang Tulisan (Format B5/A4 Standar)",
      "Unsur VI: Penampilan Layout & Desain (Max 7.0 Poin)",
      "Manajemen",
      1.0,
      1.0,
      "Ukuran bidang cetak dan marjin halaman konsisten sesuai standar penerbitan ilmiah.",
      [
        { label: "Konsisten pada ukuran A4 / B5 standar (1.0 Poin)", score: 1.0 },
        { label: "Ukuran marjin bervariasi (0.5 Poin)", score: 0.5 },
      ],
      "Desain Layout PDF Naskah",
    ),

    makeItem(
      "6B",
      "Tipografi & Konsistensi Jenis Huruf",
      "Unsur VI: Penampilan Layout & Desain (Max 7.0 Poin)",
      "Manajemen",
      1.0,
      1.0,
      "Pemilihan jenis dan ukuran huruf seragam untuk judul, subjudul, teks utama, dan caption tabel.",
      [
        { label: "Tipografi rapi & terstruktur (1.0 Poin)", score: 1.0 },
        { label: "Penggunaan jenis huruf tidak seragam (0.5 Poin)", score: 0.5 },
      ],
      "Audit Layout PDF Terbitan",
    ),

    makeItem(
      "6C",
      "Tata Letak (Layout) Paginasi & Header/Footer",
      "Unsur VI: Penampilan Layout & Desain (Max 7.0 Poin)",
      "Manajemen",
      1.0,
      1.0,
      "Tata letak halaman memuat header running title, nama jurnal, volume, nomor, serta nomor halaman.",
      [
        { label: "Tata letak profesional dengan header/footer lengkap (1.0 Poin)", score: 1.0 },
        { label: "Header/footer belum memuat informasi edisi lengkap (0.5 Poin)", score: 0.5 },
      ],
      "Layout PDF Artikel Terbit",
    ),

    makeItem(
      "6D",
      "Resolusi Dokumen & Kualitas Gambar/Grafik",
      "Unsur VI: Penampilan Layout & Desain (Max 7.0 Poin)",
      "Manajemen",
      1.0,
      1.0,
      "Resolusi gambar, grafik, dan rumus matematika tajam, jelas, dan tidak kabur saat diunduh/dicetak.",
      [
        { label: "Resolusi tinggi (min 300 dpi) & rumus tajam (1.0 Poin)", score: 1.0 },
        { label: "Terdapat gambar dengan resolusi rendah/buram (0.5 Poin)", score: 0.5 },
      ],
      "Audit Gambar & Grafik PDF",
    ),

    makeItem(
      "6E",
      "Jumlah Halaman per Volume / Terbitan Konsisten",
      "Unsur VI: Penampilan Layout & Desain (Max 7.0 Poin)",
      "Manajemen",
      2.0,
      2.0,
      "Jumlah halaman per edisi terbitan terjaga konsisten (rata-rata 8-15 halaman per artikel).",
      [
        { label: "Jumlah halaman edisi konsisten (2.0 Poin)", score: 2.0 },
        { label: "Jumlah halaman sangat fluktuatif antar edisi (1.0 Poin)", score: 1.0 },
      ],
      `Editions Database (${allEditions.length} edisi terdata)`,
    ),

    makeItem(
      "6F",
      "Desain Website & Navigasi Portal Jurnal",
      "Unsur VI: Penampilan Layout & Desain (Max 7.0 Poin)",
      "Manajemen",
      1.0,
      1.0,
      "Navigasi situs web OJS intuitif, bebas broken link, serta mudah diakses dari perangkat mobile.",
      [
        { label: "Situs web responsif, rapi, tanpa tautan rusak (1.0 Poin)", score: 1.0 },
        { label: "Terdapat navigasi yang membingungkan / link rusak (0.5 Poin)", score: 0.5 },
      ],
      "Audit Portal OJS Website",
    ),

    // Unsur VII: Keberkalaan Terbitan (Maks: 4.0 Poin)
    makeItem(
      "7A",
      "Konsistensi Jadwal Terbit (Sesuai ISSN)",
      "Unsur VII: Keberkalaan Terbitan (Max 4.0 Poin)",
      "Manajemen",
      1.0,
      1.0,
      "Jurnal terbit secara teratur sesuai dengan frekuensi yang terdaftar pada ISSN BRIN.",
      [
        { label: "Terbit tepat waktu di setiap bulan terbitan (1.0 Poin)", score: 1.0 },
        { label: "Pernah mengalami keterlambatan terbit (0.5 Poin)", score: 0.5 },
      ],
      `Editions Data (${allEditions.length} terbitan)`,
    ),

    makeItem(
      "7B",
      "Indeks Volume, Nomor & Tahun Terbit",
      "Unsur VII: Keberkalaan Terbitan (Max 4.0 Poin)",
      "Manajemen",
      1.0,
      1.0,
      "Penulisan volume, nomor terbitan, dan tahun terbit tercantum jelas dan konsisten di setiap edisi.",
      [
        { label: "Penomoran volume & tahun terstruktur penuh (1.0 Poin)", score: 1.0 },
        { label: "Terdapat ketidaksesuaian penomoran (0.5 Poin)", score: 0.5 },
      ],
      "History Edisi OJS Database",
    ),

    makeItem(
      "7C",
      "Penomoran Terbitan Berurutan (Issue Numbering)",
      "Unsur VII: Keberkalaan Terbitan (Max 4.0 Poin)",
      "Manajemen",
      1.0,
      1.0,
      "Nomor edisi berurutan dari nomor 1 hingga nomor akhir dalam satu volume tahunan.",
      [
        { label: "Penomoran terbitan selalu berurutan (1.0 Poin)", score: 1.0 },
        { label: "Ada lompatan nomor terbitan (0 Poin)", score: 0 },
      ],
      "History Edisi OJS Database",
    ),

    makeItem(
      "7D",
      "Penomoran Halaman Berurutan (Paginasi)",
      "Unsur VII: Keberkalaan Terbitan (Max 4.0 Poin)",
      "Manajemen",
      1.0,
      1.0,
      "Penomoran halaman berurutan dari artikel pertama hingga artikel terakhir dalam satu volume terbitan.",
      [
        { label: "Paginasi berurutan dalam 1 volume edisi (1.0 Poin)", score: 1.0 },
        { label: "Paginasi selalu dimulai dari halaman 1 di setiap artikel (0.5 Poin)", score: 0.5 },
      ],
      "Metadata Halaman Artikel Database",
    ),

    // Unsur VIII: Penyebarluasan (Maks: 12.0 Poin)
    makeItem(
      "8A",
      "Statistik Kunjungan Web Unik per Hari",
      "Unsur VIII: Penyebarluasan & Pengindeksan (Max 12.0 Poin)",
      "Manajemen",
      3.0,
      autoScore8A,
      `Jumlah pengunjung unik harian yang mengakses portal jurnal (${avgVisits.toFixed(0)} kunjungan/hari).`,
      [
        { label: "Tinggi (≥50 pengunjung unik/hari) (3.0 Poin)", score: 3.0 },
        { label: "Sedang (20-49 pengunjung unik/hari) (1.5 Poin)", score: 1.5 },
        { label: "Rendah (<20 pengunjung unik/hari) (0.5 Poin)", score: 0.5 },
      ],
      `Site Visits Table (${allVisits.length} log harian)`,
    ),

    makeItem(
      "8B",
      "Lembaga Pengindeks Berreputasi (Sinta/Scopus/DOAJ)",
      "Unsur VIII: Penyebarluasan & Pengindeksan (Max 12.0 Poin)",
      "Manajemen",
      8.0,
      6.0,
      "Tingkat reputasi lembaga pengindeks yang mencakup jurnal (DOAJ, Sinta, Garuda, Google Scholar).",
      [
        { label: "Terindeks Scopus / WoS (8.0 Poin)", score: 8.0 },
        { label: "Terindeks DOAJ / Copernicus (6.0 Poin)", score: 6.0 },
        { label: "Terindeks Garuda / Google Scholar (3.0 Poin)", score: 3.0 },
      ],
      "Status Pengindeks Jurnal",
    ),

    makeItem(
      "8C",
      "Digital Object Identifier (DOI Crossref) per Artikel",
      "Unsur VIII: Penyebarluasan & Pengindeksan (Max 12.0 Poin)",
      "Manajemen",
      1.0,
      autoScore8C,
      `Seluruh artikel memiliki identitas unik DOI aktif dari Crossref (${articlesWithDoi}/${allArticles.length} artikel dengan DOI).`,
      [
        { label: "100% artikel memiliki DOI aktif (1.0 Poin)", score: 1.0 },
        { label: "Sebagian artikel memiliki DOI (0.5 Poin)", score: 0.5 },
        { label: "Belum memiliki DOI Crossref (0 Poin)", score: 0 },
      ],
      `Articles Database (${allArticles.length} artikel terdata)`,
    ),
  ];

  return { journalId, indicators: list };
}

export default async function IndicatorsPage() {
  const profile = await requireRole(["administrator", "journal_manager", "editor"]);

  // Fetch journal ID
  const supabase = await createClient();
  const { data: journal } = await supabase.from("journals").select("id").limit(1).single();
  const journalId = journal?.id || "00000000-0000-0000-0000-000000000001";

  const { indicators } = await getGranularIndicatorData(journalId);

  return (
    <IndicatorInteractiveList
      userRole={profile.role}
      journalId={journalId}
      indicators={indicators}
    />
  );
}
