/**
 * Accreditation Domain Types
 * Source: MASTER_SYSTEM_PROMPT BAB 5.9 + PENDALAMAN BAB 5.2
 * Every type maps directly to a database table or a rubric indicator.
 */

// ============================================================================
// RUBRIC INDICATORS (from MASTER_SYSTEM_PROMPT BAB 5.9)
// ============================================================================

export type IndicatorCode =
  // Tata Kelola
  | "1" // Penamaan Jurnal (max 2)
  | "1.1" // Spesifisitas Penamaan (max 2)
  | "2" // Kelembagaan Penerbit (max 4/5)
  | "2.1" // Kelembagaan Penerbit & Kerjasama OPI (max 4)
  | "3A" // Mitra Bestari (max 6)
  | "3B" // Dewan Penyunting (max 5)
  | "3C" // Mutu Penyuntingan Substantif (max 3)
  | "3D" // Petunjuk Penulis (max 1)
  | "3E" // Mutu Gaya & Format (max 2)
  | "3F" // Manajemen Jurnal (max 7)
  // Substansi
  | "4A" // Cakupan Keilmuan (max 4)
  | "4B" // Aspirasi Wawasan / negara penulis (max 8)
  | "4C" // Dampak Ilmiah / sitasi (max 8)
  | "4.4" // Mutu Judul Artikel (max 1)
  | "4.5" // Mutu Abstrak & Kata Kunci (max 2)
  | "4.6" // Mutu Kebaruan/Novelty (max 5)
  | "4.7" // Metodologi & Instrumen (max 4)
  | "4.8" // Analisis & Pembahasan (max 4)
  | "4.9" // Simpulan (max 1)
  | "4.10" // Referensi Primer (max 1)
  | "4.11" // Kemutakhiran Pustaka (max 1)
  // Pengelolaan Naskah
  | "5A" // Identitas Penulis (max 1)
  | "5B" // Sistematika Artikel (max 1)
  | "5C" // Sistem Sitasi (max 1)
  | "5D" // Daftar Pustaka (max 1)
  // Penampilan
  | "6A" // Ukuran Bidang Tulisan (max 1)
  | "6B" // Tipografi (max 1)
  | "6C" // Tata Letak (max 1)
  | "6D" // Resolusi Dokumen (max 1)
  | "6E" // Jumlah Halaman/Volume (max 2)
  | "6F" // Desain Website (max 1)
  // Keberkalaan
  | "7A" // Jadwal Terbit (max 1)
  | "7B" // Indeks Volume (max 1)
  | "7C" // Penomoran Terbitan (max 1)
  | "7D" // Penomoran Halaman (max 1)
  // Penyebaran
  | "8A" // Statistik Kunjungan (max 3)
  | "8B" // Lembaga Pengindeks (max 8)
  | "8C" // Identitas Unik Artikel / DOI (max 1)
  // Per-artikel (9 komponen substansi)
  | "art_judul"
  | "art_abstrak"
  | "art_kata_kunci"
  | "art_instrumen"
  | "art_bahasa"
  | "art_novelty"
  | "art_kontribusi"
  | "art_referensi_primer"
  | "art_kemutakhiran_referensi"
  | "art_analisis"
  | "art_simpulan"
  | string;

export type ScoreSource = "otomatis" | "estimasi_ai" | "verifikasi_manusia" | "belum_diisi";

export interface ScoreEstimate {
  id: string;
  entitasId: string;
  entitasTipe: "jurnal" | "edisi" | "artikel";
  indikatorKode: IndicatorCode;
  indikatorNama: string;
  skor: number | null;
  skorMaks: number;
  sumber: ScoreSource;
  versiRubrik: string;
  catatan?: string;
  tanggalHitung: string;
}

// ============================================================================
// ACCREDITATION SCORE REPORT (output of agregasiSkorJurnal)
// BAB 5.6 PENDALAMAN — skema JSON output dashboard
// ============================================================================

export interface JournalScoreReport {
  jurnalId: string;
  versiRubrik: string;
  tanggalHitung: string;
  disclaimer: string;
  /** Total estimated score (sum of all indicators) */
  totalEstimasi: number | null;
  /** Max theoretical score */
  totalMaks: number;
  /** Percentage of max */
  persentase: number | null;
  /** Estimated Sinta level based on score */
  estimasiSintaLevel:
    "sinta_1" | "sinta_2" | "sinta_3" | "sinta_4" | "sinta_5" | "sinta_6" | "tidak_terakreditasi";
  scores: Partial<Record<IndicatorCode, ScoreEstimate>>;
  /** Top 3 priority alerts for editors */
  peringatanPrioritas: PriorityAlert[];
  /** Current roadmap phase (0–4) */
  faseSaatIni: 0 | 1 | 2 | 3 | 4;
  /** Phase exit criteria status */
  kriteriaKeluar: PhaseExitStatus[];
}

export interface PriorityAlert {
  kode: IndicatorCode;
  indikatorNama: string;
  pesan: string;
  prioritas: "tinggi" | "sedang" | "rendah";
  skorSaatIni: number | null;
  skorMaks: number;
  gap: number;
}

export interface PhaseExitStatus {
  fase: 0 | 1 | 2 | 3 | 4;
  targetSinta: string;
  sudahTerpenuhi: boolean;
  kriteria: CriteriaStatus[];
}

export interface CriteriaStatus {
  deskripsi: string;
  terpenuhi: boolean;
  nilaiSaatIni: number | string | null;
  targetNilai: number | string;
}

// ============================================================================
// CORE DOMAIN ENTITIES
// ============================================================================

export type StatusSinta =
  "sinta_1" | "sinta_2" | "sinta_3" | "sinta_4" | "sinta_5" | "sinta_6" | "tidak_terakreditasi";

export interface Journal {
  id: string;
  nama: string;
  pIssn?: string;
  eIssn?: string;
  urlSitus?: string;
  focusAndScope?: string;
  statusSinta?: StatusSinta;
  tanggalAkreditasiTerakhir?: string;
  tanggalAkreditasiBerakhir?: string;
  frekuensiTerbitPerTahun?: number;
  nomorRubrikInstrumen: string;
  // Manual scores
  skorPenamaanJurnal?: number;
  skorKelembagaanPenerbit?: number;
  skorManajemenJurnal?: number;
  skorLembagaPengindeks?: number;
  catatan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Edition {
  id: string;
  journalId: string;
  volume: number;
  nomor: number;
  tahun: number;
  tanggalTerbitRencana?: string;
  tanggalTerbitAktual?: string;
  status: "draft" | "persiapan" | "siap_terbit" | "terbit";
  totalHalaman?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  editionId: string;
  judul: string;
  judulSirahan?: string;
  abstrak?: string;
  kataKunci?: string[];
  doi?: string;
  halamanAwal?: number;
  halamanAkhir?: number;
  status: "draft" | "review" | "revisi" | "diterima" | "ditolak" | "terbit";
  tanggalSubmit?: string;
  tanggalRevisi?: string;
  tanggalDiterima?: string;
  klinikDilaksanakan: boolean;
  tanggalKlinik?: string;
  klinikDisetujuiPenulis: boolean;
  lisensi?: string;
  pernyataanCopyright?: string;
  metadataLengkap: boolean;
  bidangIlmu?: "ilmu_komputer" | "sains" | "sosial" | "pendidikan" | "bahasa" | "lainnya";
  createdAt: string;
  updatedAt: string;
}

export interface ArticleAuthor {
  id: string;
  articleId: string;
  urutan: number;
  nama: string;
  email?: string;
  afiliasi?: string;
  negara?: string; // ISO 3166-1 alpha-2
  orcid?: string;
}

export interface ArticleReference {
  id: string;
  articleId: string;
  urutan?: number;
  teksLengkap: string;
  jenisSumber?: "jurnal" | "buku" | "prosiding" | "website" | "laporan" | "lainnya";
  tahunTerbit?: number;
  terverifikasiOtomatis: boolean;
}

export interface ArticleCitation {
  id: string;
  articleId: string;
  sumberData: "openalex" | "crossref" | "google_scholar";
  jumlahSitasi: number;
  tanggalTarik: string;
}

export interface Reviewer {
  id: string;
  journalId: string;
  nama: string;
  email?: string;
  afiliasi?: string;
  negara: string;
  kualifikasiInternasional: boolean;
  tautanOrcid?: string;
  tautanScopus?: string;
  tautanGoogleScholar?: string;
  statusAktif: boolean;
  tanggalBergabung?: string;
  tanggalTerakhirAktif?: string;
  bidangKeahlian?: string[];
  catatan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EditorialBoardMember {
  id: string;
  journalId: string;
  nama: string;
  email?: string;
  afiliasi?: string;
  negara: string;
  kualifikasiInternasional: boolean;
  jabatan?: string;
  tautanOrcid?: string;
  tautanScopus?: string;
  tautanGoogleScholar?: string;
  statusAktif: boolean;
  tanggalBergabung?: string;
  bidangKeahlian?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ArticleReadinessCard {
  id: string;
  articleId: string;
  tanggalReviewRevisiPertama?: string;
  tanggalKlinik?: string;
  chkJudulAbstrak: boolean;
  chkNoveltyKontribusi: boolean;
  chkReferensi: boolean;
  chkAnalisisSimpulan: boolean;
  persetujuanPenulis: boolean;
  catatanEditor?: string;
  dibuatOleh?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeskEvaluationCheck {
  id: string;
  journalId: string;
  tanggalCek: string;
  dibuatOleh?: string;
  item1NamaIssn?: boolean;
  item2UrlBenar?: boolean;
  item3StatusSinta?: boolean;
  item4MasaBerlaku?: boolean;
  item5EtikaCope?: boolean;
  item6AkunDemo?: boolean;
  item7FrekuensiTerbit?: boolean;
  item8MinArtikelPdf?: boolean;
  statusKeseluruhan?: boolean;
  catatan?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  role: "administrator" | "journal_manager" | "editor";
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// REVIEWER DIVERSITY SUMMARY (for score 3A)
// ============================================================================

export interface ReviewerDiversitySummary {
  totalAktif: number;
  jumlahNegara: number;
  negara: string[];
  jumlahInternasional: number;
  persentaseInternasional: number;
  skorEstimasi3A: number;
  skorMaks3A: 6;
  status: "aman" | "perlu_perhatian" | "kritis";
}

export interface EditorialBoardDiversitySummary {
  totalAktif: number;
  jumlahNegara: number;
  negara: string[];
  jumlahInternasional: number;
  persentaseInternasional: number;
  skorEstimasi3B: number;
  skorMaks3B: 5;
  status: "aman" | "perlu_perhatian" | "kritis";
}
