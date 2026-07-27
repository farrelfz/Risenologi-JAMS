import { Metadata } from "next";
import { requireRole } from "@/features/auth/actions";
import { createClient } from "@supabase/supabase-js";
import { IndicatorInteractiveList, IndicatorItem } from "./indicator-interactive-list";

export const metadata: Metadata = {
  title: "Rincian Indikator Akreditasi (100 Poin Instrument 134/E/KPT/2021)",
  description: "Rincian skor terhitung real-time per indikator akreditasi Jurnal Risenologi.",
};

async function getIndicatorData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const [
    { data: journal },
    { data: reviewers },
    { data: editorialBoard },
    { data: editions },
    { data: articles },
    { data: articleAuthors },
  ] = await Promise.all([
    supabase.from("journals").select("*").limit(1).single(),
    supabase.from("reviewers").select("*"),
    supabase.from("editorial_board").select("*"),
    supabase.from("editions").select("*"),
    supabase.from("articles").select("id, judul, doi, status, abstrak"),
    supabase.from("article_authors").select("id, nama, negara, afiliasi"),
  ]);

  const allReviewers = reviewers || [];
  const allEdBoard = editorialBoard || [];
  const allArticles = articles || [];
  const allEditions = editions || [];
  const allAuthors = articleAuthors || [];

  // Reviewer stats
  const intlReviewers = allReviewers.filter(
    (r: any) => r.kualifikasi_internasional || (r.negara && r.negara !== "Indonesia"),
  ).length;
  const reviewerCountries = Array.from(
    new Set(allReviewers.map((r: any) => r.negara).filter(Boolean)),
  );
  const reviewerIntlRatio = allReviewers.length > 0 ? intlReviewers / allReviewers.length : 0;
  const score3A =
    reviewerCountries.length >= 4 && reviewerIntlRatio > 0.5
      ? 6.0
      : reviewerCountries.length >= 2
        ? 4.0
        : 2.0;

  // Editorial board stats
  const edBoardCountries = Array.from(
    new Set(allEdBoard.map((e: any) => e.negara).filter(Boolean)),
  );
  const edBoardIntl = allEdBoard.filter(
    (e: any) => e.negara && e.negara !== "Indonesia",
  ).length;
  const edBoardRatio = allEdBoard.length > 0 ? edBoardIntl / allEdBoard.length : 0;
  const score3B =
    edBoardCountries.length >= 4 && edBoardRatio > 0.5 ? 5.0 : edBoardCountries.length >= 2 ? 3.0 : 1.0;

  // Articles & DOI
  const articlesWithDoi = allArticles.filter((a: any) => a.doi && a.doi.trim().length > 0).length;
  const doiRatio = allArticles.length > 0 ? articlesWithDoi / allArticles.length : 0;
  const score8C = doiRatio >= 1 ? 1.0 : doiRatio > 0.5 ? 0.5 : 0;

  // Author countries
  const authorCountries = Array.from(
    new Set(allAuthors.map((a: any) => a.negara).filter(Boolean)),
  );
  const score4B =
    authorCountries.length >= 5 ? 8.0 : authorCountries.length >= 3 ? 6.0 : authorCountries.length >= 2 ? 3.0 : 1.0;

  const indicators: IndicatorItem[] = [
    {
      id: "1",
      name: "Unsur I: Penamaan Jurnal",
      maxScore: 2,
      currentScore: journal?.nama ? 1 : 0,
      status: journal?.nama ? "warning" : "critical",
      recommendation:
        "Nama Risenologi terdaftar p-ISSN/e-ISSN BRIN. Karena masih bersifat multidisiplin, pertegas keilmuan spesifik di deskripsi header OJS.",
      details: [{ name: "Kesesuaian nama jurnal dengan spesifikasi keilmuan", score: 1 }],
    },
    {
      id: "2",
      name: "Unsur II: Kelembagaan Penerbit",
      maxScore: 4,
      currentScore: 3,
      status: "warning",
      recommendation:
        "Diterbitkan oleh LPPM UNJ (Perguruan Tinggi). Unggah MoU kerjasama dengan Organisasi Profesi (OPI) untuk meraih 4.0 Poin penuh.",
      details: [
        { name: "Kelembagaan PT / Lembaga Penelitian (3.0 Poin)", score: 3 },
        { name: "MoU Kerjasama Organisasi Profesi (1.0 Poin)", score: 0 },
      ],
    },
    {
      id: "3",
      name: "Unsur III: Penyuntingan & Manajemen (OJS 3.3)",
      maxScore: 19,
      currentScore: score3A + score3B + 2.0 + 1.0 + 2.0 + 2.0,
      status: score3A >= 6 ? "good" : "warning",
      recommendation:
        "Pastikan mitra bestari dari minimal 4 negara luar negeri dengan Scopus ID terverifikasi & tampilkan daftar reviewer di website OJS.",
      details: [
        {
          name: `3A. Mitra Bestari (${reviewerCountries.length} negara, ${(reviewerIntlRatio * 100).toFixed(0)}% internasional)`,
          score: score3A,
        },
        {
          name: `3B. Dewan Penyunting (${edBoardCountries.length} negara, ${allEdBoard.length} editor)`,
          score: score3B,
        },
        { name: "3C. Review Substantif di OJS", score: 2 },
        { name: "3D. Petunjuk Penulis & Template (.docx)", score: 1 },
        { name: "3E. Mutu Gaya & Format Layout PDF", score: 2 },
        { name: "3F. Manajemen Daring Full Online OJS 3.3", score: 2 },
      ],
    },
    {
      id: "4",
      name: "Unsur IV: Substansi Artikel",
      maxScore: 41,
      currentScore: 4.0 + score4B + 4.0 + 15.0,
      status: "warning",
      recommendation:
        "Tingkatkan kolaborasi penulis internasional ( target >5 negara) dan tingkatkan proporsi pustaka rujukan primer >80% dari jurnal 10 tahun terakhir.",
      details: [
        { name: "4A. Cakupan Keilmuan (Focus & Scope)", score: 4 },
        { name: `4B. Aspirasi Wawasan (${authorCountries.length} negara penulis)`, score: score4B },
        { name: "4C. Dampak Ilmiah & Sitasi (Dimensions/Scholar)", score: 4 },
        { name: "4D..N. Novelty, Metodologi & Ref Primer >80%", score: 15 },
      ],
    },
    {
      id: "5",
      name: "Unsur V: Gaya Penulisan & Reference Manager",
      maxScore: 11,
      currentScore: 8,
      status: "good",
      recommendation:
        "Struktur IMRaD dan abstrak bilingual terverifikasi rapi. Wajibkan penggunaan Mendeley/Zotero secara konsisten.",
      details: [
        { name: "Format Judul, Penulis & Abstrak Bilingual", score: 4 },
        { name: "Struktur IMRaD & Istilah Ilmiah", score: 2 },
        { name: "Pengutipan & Penggunaan Mendeley/Zotero", score: 2 },
      ],
    },
    {
      id: "6-7",
      name: "Unsur VI & VII: Penampilan & Keberkalaan Edisi",
      maxScore: 11,
      currentScore: 8,
      status: "good",
      recommendation:
        "Terbit berkala 2 edisi/tahun (April & Desember) tanpa tunggakan. Pertahankan ketepatan jadwal terbit online per semester.",
      details: [
        { name: `Keberkalaan Terbit (${allEditions.length} edisi terdata)`, score: 4 },
        { name: "Tata Letak, Tipografi & Resolusi PDF", score: 4 },
      ],
    },
    {
      id: "8",
      name: "Unsur VIII: Penyebarluasan & DOI Crossref",
      maxScore: 12,
      currentScore: 1.5 + 6.0 + score8C,
      status: score8C === 1 ? "good" : "warning",
      recommendation:
        "Pastikan seluruh artikel baru terdaftar DOI Crossref (Prefix 10.47028) dan pasang widget visitor counter publik di sidebar OJS.",
      details: [
        { name: "8A. Statistik Kunjungan (Visitor Counter)", score: 1.5 },
        { name: "8B. Lembaga Pengindeks (DOAJ, Garuda, Dimensions)", score: 6 },
        { name: `8C. Identitas Unik DOI Crossref (${articlesWithDoi}/${allArticles.length} aktif)`, score: score8C },
      ],
    },
  ];

  return indicators;
}

export default async function IndicatorsPage() {
  await requireRole(["administrator", "journal_manager", "editor"]);
  const indicators = await getIndicatorData();
  return <IndicatorInteractiveList initialIndicators={indicators} />;
}
