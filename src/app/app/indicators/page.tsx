import { Metadata } from "next";
import { requireRole } from "@/features/auth/actions";
import { IndicatorInteractiveList, IndicatorItem } from "./indicator-interactive-list";

export const metadata: Metadata = {
  title: "Rincian Indikator Akreditasi",
};

const INDICATORS: IndicatorItem[] = [
  {
    id: "1",
    name: "Penamaan Jurnal Ilmiah",
    maxScore: 3,
    currentScore: 3,
    status: "good",
    recommendation:
      "Penamaan jurnal sudah sangat spesifik dan mencerminkan bidang ilmu sains dan teknologi. Pertahankan spesifikasi ini.",
    details: [{ name: "Penamaan jurnal spesifik dan mencerminkan bidang ilmu", score: 3 }],
  },
  {
    id: "2",
    name: "Kelembagaan Penerbit",
    maxScore: 4,
    currentScore: 2,
    status: "warning",
    recommendation:
      "Tingkatkan kerja sama penerbitan dengan organisasi profesi ilmiah tingkat nasional atau internasional untuk menambah 2 poin.",
    details: [
      { name: "Badan penyelenggara (Universitas/Fakultas/Asosiasi)", score: 2 },
      { name: "Keterlibatan mitra bestari / Asosiasi", score: 0 },
    ],
  },
  {
    id: "3",
    name: "Penyuntingan & Manajemen",
    maxScore: 18,
    currentScore: 6,
    status: "critical",
    recommendation:
      "Wajib merekrut minimal 3 Mitra Bestari dari negara lain (luar Indonesia) untuk mencapai rasio internasional >50% dan meraih skor maksimal 6 Poin pada Indikator 3A.",
    details: [
      {
        name: "Pelibatan Mitra Bestari Internasional (Target: >50% dari ≥4 negara)",
        score: 1,
        max: 6,
      },
      { name: "Kualifikasi Dewan Penyunting", score: 2, max: 4 },
      { name: "Petunjuk Penulisan", score: 2, max: 2 },
      { name: "Proses Penyuntingan", score: 1, max: 6 },
    ],
  },
  {
    id: "4",
    name: "Substansi Artikel",
    maxScore: 39,
    currentScore: 15,
    status: "warning",
    recommendation:
      "Perbanyak kutipan dari artikel jurnal ilmiah bereputasi (min. 85% referensi primer) dan tingkatkan persentase referensi 10 tahun terakhir.",
    details: [
      { name: "Cakupan Keilmuan", score: 3, max: 5 },
      { name: "Aspirasi Wawasan (Sebaran asal penulis)", score: 2, max: 6 },
      { name: "Kepeloporan Ilmiah (Orisinalitas)", score: 5, max: 10 },
      { name: "Dampak Ilmiah (Sitasi)", score: 2, max: 7 },
      { name: "Nisbah Rujukan Primer", score: 2, max: 5 },
      { name: "Derajat Kemutakhiran Rujukan", score: 1, max: 6 },
    ],
  },
  {
    id: "5",
    name: "Gaya Penulisan",
    maxScore: 9,
    currentScore: 7,
    status: "good",
    recommendation:
      "Gaya penulisan dan konsistensi daftar pustaka sudah sangat baik. Pastikan penulisan sitasi menggunakan standar APA/IEEE secara konsisten.",
    details: [
      { name: "Keefektifan Judul Artikel", score: 1, max: 1 },
      { name: "Pencantuman Nama dan Lembaga Penulis", score: 1, max: 1 },
      { name: "Abstrak", score: 2, max: 2 },
      { name: "Format dan Sistematika", score: 1, max: 2 },
      { name: "Penggunaan Istilah Kebahasaan", score: 1, max: 1 },
      { name: "Cara Pengutipan dan Daftar Pustaka", score: 1, max: 2 },
    ],
  },
  {
    id: "6",
    name: "Penampilan",
    maxScore: 6,
    currentScore: 4,
    status: "good",
    recommendation:
      "Desain sampul terbitan dan tata letak PDF artikel perlu sedikit diperbarui agar terlihat profesional sesuai tren jurnal bereputasi.",
    details: [
      { name: "Ukuran Bidang Tulisan", score: 1, max: 1 },
      { name: "Tata Letak", score: 1, max: 2 },
      { name: "Tipografi", score: 1, max: 1 },
      { name: "Resolusi Dokumen", score: 1, max: 1 },
      { name: "Desain Sampul", score: 0, max: 1 },
    ],
  },
  {
    id: "7",
    name: "Keberkalaan",
    maxScore: 8,
    currentScore: 5,
    status: "warning",
    recommendation:
      "Pastikan jadwal penerbitan tepat waktu sesuai jadwal per semester/bulan tanpa ada penundaan rilis edisi.",
    details: [
      { name: "Jadwal Penerbitan", score: 2, max: 3 },
      { name: "Penomoran Terbitan", score: 1, max: 1 },
      { name: "Penomoran Halaman", score: 1, max: 1 },
      { name: "Indeks Subjek dan Penulis", score: 1, max: 3 },
    ],
  },
  {
    id: "8",
    name: "Penyebarluasan",
    maxScore: 13,
    currentScore: 5,
    status: "critical",
    recommendation:
      "Daftarkan artikel ke pengindeks internasional bereputasi (DOAJ, Copac, Google Scholar, Scopus) dan aktifkan pengidentifikasi objek digital (DOI) untuk setiap artikel.",
    details: [
      { name: "Jumlah Kunjungan Unik (Traffic)", score: 2, max: 4 },
      { name: "Pencantuman di Pengindeks Internasional Bereputasi", score: 1, max: 6 },
      { name: "Penggunaan DOI", score: 2, max: 3 },
    ],
  },
];

export default async function IndicatorsPage() {
  await requireRole(["administrator", "journal_manager", "editor"]);

  const totalCurrentScore = INDICATORS.reduce((acc, curr) => acc + curr.currentScore, 0);

  return (
    <div className="pb-12">
      <IndicatorInteractiveList indicators={INDICATORS} totalScore={totalCurrentScore} />
    </div>
  );
}
