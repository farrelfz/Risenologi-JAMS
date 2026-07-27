/**
 * Validation schemas for all Server Actions
 * Source: Feature Architecture Blueprint — "Validation uses Zod"
 * All Server Actions must validate input before executing.
 */
import { z } from "zod";

// ============================================================================
// AUTH
// ============================================================================

export const signInSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export type SignInInput = z.infer<typeof signInSchema>;

// ============================================================================
// REVIEWER
// ============================================================================

export const reviewerSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter").max(200),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  afiliasi: z.string().max(300).optional(),
  negara: z.string().length(2, "Gunakan kode ISO 2 huruf, mis. ID, US, MY"),
  kualifikasiInternasional: z.boolean().default(false),
  tautanOrcid: z.string().url("Format URL tidak valid").optional().or(z.literal("")),
  tautanScopus: z.string().url("Format URL tidak valid").optional().or(z.literal("")),
  tautanGoogleScholar: z.string().url("Format URL tidak valid").optional().or(z.literal("")),
  statusAktif: z.boolean().default(true),
  tanggalBergabung: z.string().optional(),
  bidangKeahlian: z.array(z.string()).optional(),
  catatan: z.string().max(1000).optional(),
});

export type ReviewerInput = z.infer<typeof reviewerSchema>;

// ============================================================================
// EDITORIAL BOARD MEMBER
// ============================================================================

export const editorialBoardMemberSchema = z.object({
  nama: z.string().min(2).max(200),
  email: z.string().email().optional().or(z.literal("")),
  afiliasi: z.string().max(300).optional(),
  negara: z.string().length(2, "Gunakan kode ISO 2 huruf"),
  kualifikasiInternasional: z.boolean().default(false),
  jabatan: z.string().max(100).optional(),
  tautanOrcid: z.string().url().optional().or(z.literal("")),
  tautanScopus: z.string().url().optional().or(z.literal("")),
  tautanGoogleScholar: z.string().url().optional().or(z.literal("")),
  statusAktif: z.boolean().default(true),
  tanggalBergabung: z.string().optional(),
  bidangKeahlian: z.array(z.string()).optional(),
});

export type EditorialBoardMemberInput = z.infer<typeof editorialBoardMemberSchema>;

// ============================================================================
// ARTICLE
// ============================================================================

export const articleSchema = z.object({
  judul: z.string().min(5, "Judul minimal 5 karakter").max(500),
  judulSirahan: z.string().max(50, "Running title max 50 karakter").optional(),
  abstrak: z.string().min(100, "Abstrak minimal 100 karakter").optional(),
  kataKunci: z.array(z.string()).min(3, "Minimal 3 kata kunci").optional(),
  doi: z
    .string()
    .regex(/^10\.\d{4,}\//, "Format DOI tidak valid (mulai 10.xxxx/)")
    .optional()
    .or(z.literal("")),
  halamanAwal: z.number().int().positive().optional(),
  halamanAkhir: z.number().int().positive().optional(),
  bidangIlmu: z
    .enum(["ilmu_komputer", "sains", "sosial", "pendidikan", "bahasa", "lainnya"])
    .optional(),
  tanggalSubmit: z.string().optional(),
  tanggalRevisi: z.string().optional(),
  tanggalDiterima: z.string().optional(),
  lisensi: z.string().optional(),
  pernyataanCopyright: z.string().optional(),
});

export type ArticleInput = z.infer<typeof articleSchema>;

// ============================================================================
// ARTICLE AUTHOR
// ============================================================================

export const articleAuthorSchema = z.object({
  urutan: z.number().int().positive(),
  nama: z.string().min(2).max(200),
  email: z.string().email().optional().or(z.literal("")),
  afiliasi: z.string().max(300).optional(),
  negara: z.string().length(2).optional(),
  orcid: z
    .string()
    .regex(/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/, "Format ORCID: 0000-0000-0000-0000")
    .optional()
    .or(z.literal("")),
});

export type ArticleAuthorInput = z.infer<typeof articleAuthorSchema>;

// ============================================================================
// DESK EVALUATION
// ============================================================================

export const deskEvaluationSchema = z.object({
  item1NamaIssn: z.boolean(),
  item2UrlBenar: z.boolean(),
  item3StatusSinta: z.boolean(),
  item4MasaBerlaku: z.boolean(),
  item5EtikaCope: z.boolean(),
  item6AkunDemo: z.boolean(),
  item7FrekuensiTerbit: z.boolean(),
  item8MinArtikelPdf: z.boolean(),
  catatan: z.string().max(2000).optional(),
});

export type DeskEvaluationInput = z.infer<typeof deskEvaluationSchema>;

// ============================================================================
// EDITION
// ============================================================================

export const editionSchema = z.object({
  volume: z.number().int().positive(),
  nomor: z.number().int().positive(),
  tahun: z.number().int().min(2000).max(2100),
  tanggalTerbitRencana: z.string().optional(),
  totalHalaman: z.number().int().positive().optional(),
});

export type EditionInput = z.infer<typeof editionSchema>;

// ============================================================================
// JOURNAL
// ============================================================================

export const journalSchema = z.object({
  nama: z.string().min(3).max(300),
  pIssn: z
    .string()
    .regex(/^\d{4}-\d{3}[\dX]$/, "Format ISSN: 0000-0000")
    .optional()
    .or(z.literal("")),
  eIssn: z
    .string()
    .regex(/^\d{4}-\d{3}[\dX]$/, "Format E-ISSN: 0000-0000")
    .optional()
    .or(z.literal("")),
  urlSitus: z.string().url("URL tidak valid").optional().or(z.literal("")),
  focusAndScope: z.string().min(20, "Focus & Scope minimal 20 karakter").optional(),
  statusSinta: z
    .enum(["sinta_1", "sinta_2", "sinta_3", "sinta_4", "sinta_5", "sinta_6", "tidak_terakreditasi"])
    .optional(),
  tanggalAkreditasiTerakhir: z.string().optional(),
  tanggalAkreditasiBerakhir: z.string().optional(),
  frekuensiTerbitPerTahun: z.number().int().min(1).max(12).optional(),
  // Manual rubric scores
  skorPenamaanJurnal: z.number().min(0).max(2).optional(),
  skorKelembagaanPenerbit: z.number().min(0).max(5).optional(),
  skorManajemenJurnal: z.number().min(0).max(2).optional(),
  skorLembagaPengindeks: z.number().min(0).max(8).optional(),
  catatan: z.string().max(2000).optional(),
});

export type JournalInput = z.infer<typeof journalSchema>;
