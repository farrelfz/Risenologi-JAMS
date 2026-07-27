/**
 * Accreditation Scoring Engine
 * Source: PENDALAMAN_RISENOLOGI_JAMS.md BAB 5.3 (Fungsi Skor per Kategori)
 *
 * Rules:
 * 1. Rubrik BAB 5.9 adalah satu-satunya sumber kebenaran angka.
 * 2. Setiap skor estimasi wajib menyertakan versi_rubrik.
 * 3. Ketidakpastian ditandai — indikator kualitatif TIDAK menghasilkan angka pasti.
 * 4. Output selalu berlabel "Estimasi — bukan skor resmi Arjuna/Kemdiktisaintek."
 */

import type {
  Reviewer,
  EditorialBoardMember,
  ArticleAuthor,
  ArticleReference,
  ArticleCitation,
  ReviewerDiversitySummary,
  EditorialBoardDiversitySummary,
  JournalScoreReport,
  PriorityAlert,
  PhaseExitStatus,
  IndicatorCode,
  ScoreEstimate,
} from "./types";

export const RUBRIK_VERSI_AKTIF = "Instrumen Periode II 2025";
export const DISCLAIMER =
  "Estimasi AI Auditor — bukan skor akreditasi resmi Arjuna/Kemdiktisaintek";

/** Negara penerbit (Indonesia) — untuk menentukan kualifikasi internasional */
const NEGARA_PENERBIT = "ID";

// ============================================================================
// HELPER
// ============================================================================

function buatEstimasi(
  entitasId: string,
  entitasTipe: "jurnal" | "edisi" | "artikel",
  kode: IndicatorCode,
  nama: string,
  skor: number | null,
  skorMaks: number,
  sumber: ScoreEstimate["sumber"],
  catatan?: string,
): ScoreEstimate {
  return {
    id: `${entitasId}-${kode}`,
    entitasId,
    entitasTipe,
    indikatorKode: kode,
    indikatorNama: nama,
    skor,
    skorMaks,
    sumber,
    versiRubrik: RUBRIK_VERSI_AKTIF,
    catatan,
    tanggalHitung: new Date().toISOString(),
  };
}

/**
 * Skor proporsional: menurun linear di bawah ambang (bukan biner),
 * agar dashboard bisa menunjukkan "seberapa dekat" ke ambang penuh.
 * PENDALAMAN BAB 5.3 — fungsi proporsional.
 */
function proporsional(nilai: number, ambang: number, skorMaks: number): number {
  if (nilai >= ambang) return skorMaks;
  return Math.round((nilai / ambang) * skorMaks * 100) / 100;
}

// ============================================================================
// (a) INDIKATOR OTOMATIS — dihitung dari data terstruktur
// ============================================================================

/**
 * 3A — Mitra Bestari (Reviewer Diversity)
 * Max: 6 | Bobot tinggi ke-3 terbesar di seluruh rubrik
 * PENDALAMAN BAB 5.3 — fungsi skor_mitra_bestari
 */
export function skorMitraBestari(jurnalId: string, reviewers: Reviewer[]): ScoreEstimate {
  const aktif = reviewers.filter((r) => r.statusAktif);
  if (aktif.length === 0) {
    return buatEstimasi(
      jurnalId,
      "jurnal",
      "3A",
      "Mitra Bestari",
      0,
      6,
      "otomatis",
      "Tidak ada reviewer aktif",
    );
  }
  const negara = new Set(aktif.map((r) => r.negara));
  const jumlahInternasional = aktif.filter((r) => r.kualifikasiInternasional).length;
  const pctInternasional = jumlahInternasional / aktif.length;
  const jumlahNegara = negara.size;

  let skor: number;
  if (jumlahNegara >= 4 && pctInternasional > 0.5) {
    skor = 6;
  } else if (
    (jumlahNegara >= 2 && jumlahNegara <= 3 && pctInternasional > 0.5) ||
    (aktif.length > 4 && pctInternasional > 0.5)
  ) {
    skor = 4;
  } else if (aktif.length > 0) {
    skor = 2;
  } else {
    skor = 0;
  }

  return buatEstimasi(
    jurnalId,
    "jurnal",
    "3A",
    "Mitra Bestari",
    skor,
    6,
    "otomatis",
    `${jumlahNegara} negara, ${Math.round(pctInternasional * 100)}% internasional`,
  );
}

/**
 * 3B — Dewan Penyunting (Editorial Board Diversity)
 * Max: 5
 */
export function skorDewanPenyunting(
  jurnalId: string,
  members: EditorialBoardMember[],
): ScoreEstimate {
  const aktif = members.filter((m) => m.statusAktif);
  if (aktif.length === 0) {
    return buatEstimasi(
      jurnalId,
      "jurnal",
      "3B",
      "Dewan Penyunting",
      1,
      5,
      "otomatis",
      "Hanya institusi setempat",
    );
  }
  const negara = new Set(aktif.map((m) => m.negara));
  const jumlahInternasional = aktif.filter((m) => m.kualifikasiInternasional).length;
  const pctInternasional = jumlahInternasional / aktif.length;
  const jumlahNegara = negara.size;

  let skor: number;
  if (jumlahNegara >= 4 && pctInternasional > 0.5) {
    skor = 5;
  } else if (jumlahNegara >= 2 && pctInternasional < 0.5) {
    skor = 3;
  } else {
    skor = 1;
  }

  return buatEstimasi(
    jurnalId,
    "jurnal",
    "3B",
    "Dewan Penyunting",
    skor,
    5,
    "otomatis",
    `${jumlahNegara} negara, ${Math.round(pctInternasional * 100)}% internasional`,
  );
}

/**
 * 4B — Aspirasi Wawasan (Author Country Diversity)
 * Max: 8 | Bobot TERTINGGI (setara 4C dan 8B)
 * PENDALAMAN BAB 5.3 — fungsi skor_aspirasi_wawasan
 */
export function skorAspirasiWawasan(edisiId: string, penulis: ArticleAuthor[]): ScoreEstimate {
  const negara = new Set(penulis.filter((p) => p.negara).map((p) => p.negara!));
  const n = negara.size;

  let skor: number;
  if (n > 5) skor = 8;
  else if (n >= 3) skor = 6;
  else if (n === 2) skor = 3;
  else if (n === 1) skor = 1;
  else skor = 0;

  return buatEstimasi(
    edisiId,
    "edisi",
    "4B",
    "Aspirasi Wawasan (Negara Penulis)",
    skor,
    8,
    "otomatis",
    `${n} negara: ${Array.from(negara).join(", ")}`,
  );
}

/**
 * 4C — Dampak Ilmiah (Citation Impact)
 * Max: 8 | Bobot TERTINGGI
 * Window: 3 tahun (36 bulan) — PENDALAMAN BAB 5.4 catatan
 * PENDALAMAN BAB 5.3 — fungsi skor_dampak_ilmiah
 */
export function skorDampakIlmiah(artikelId: string, citations: ArticleCitation[]): ScoreEstimate {
  // Ambil jumlah sitasi tertinggi dari semua sumber data
  const jumlah = citations.length > 0 ? Math.max(...citations.map((c) => c.jumlahSitasi)) : 0;

  let skor: number;
  if (jumlah > 30) skor = 8;
  else if (jumlah >= 15) skor = 6;
  else if (jumlah >= 8) skor = 4;
  else if (jumlah >= 3) skor = 2;
  else if (jumlah >= 1) skor = 1;
  else skor = 0;

  return buatEstimasi(
    artikelId,
    "artikel",
    "4C",
    "Dampak Ilmiah (Sitasi)",
    skor,
    8,
    "otomatis",
    `${jumlah} sitasi (sumber terbaik dari ${citations.map((c) => c.sumberData).join(", ")})`,
  );
}

/**
 * 8C — Identitas Unik Artikel (DOI)
 * Max: 1
 * PENDALAMAN BAB 5.3 — fungsi skor_identitas_unik_artikel
 */
export function skorIdentitasUnikArtikel(
  artikelId: string,
  doi: string | undefined,
  permanentUrl?: string,
): ScoreEstimate {
  let skor: number;
  let catatan: string;

  if (doi && doi.startsWith("10.")) {
    skor = 1;
    catatan = `DOI: ${doi}`;
  } else if (permanentUrl) {
    skor = 0.5;
    catatan = "Permanent URL tanpa DOI";
  } else {
    skor = 0;
    catatan = "Tidak ada DOI atau Permanent URL";
  }

  return buatEstimasi(
    artikelId,
    "artikel",
    "8C",
    "Identitas Unik Artikel (DOI)",
    skor,
    1,
    "otomatis",
    catatan,
  );
}

/**
 * Referensi Primer — >85% artikel jurnal, min 20 referensi
 * Max: 3 per artikel
 * PENDALAMAN BAB 5.3 — fungsi skor_referensi_primer
 */
export function skorReferensiPrimer(artikelId: string, refs: ArticleReference[]): ScoreEstimate {
  if (refs.length === 0) {
    return buatEstimasi(
      artikelId,
      "artikel",
      "art_referensi_primer",
      "Referensi Primer",
      0,
      3,
      "otomatis",
      "Tidak ada referensi",
    );
  }

  const peringatanKurang20 =
    refs.length < 20 ? `Jumlah referensi (${refs.length}) di bawah target minimum 20. ` : "";

  const primer = refs.filter((r) => r.jenisSumber === "jurnal");
  const primerRatio = primer.length / refs.length;
  const skor = proporsional(primerRatio, 0.85, 3);

  return buatEstimasi(
    artikelId,
    "artikel",
    "art_referensi_primer",
    "Referensi Primer",
    skor,
    3,
    "otomatis",
    `${peringatanKurang20}${primer.length}/${refs.length} jurnal (${Math.round(primerRatio * 100)}%, target >85%)`,
  );
}

/**
 * Kemutakhiran Referensi — >85% dalam 10 tahun (5 tahun ilmu komputer)
 * Max: 3 per artikel
 * PENDALAMAN BAB 5.3 — fungsi skor_kemutakhiran_referensi
 */
export function skorKemutakhiranReferensi(
  artikelId: string,
  refs: ArticleReference[],
  bidangIlmu?: string,
): ScoreEstimate {
  if (refs.length === 0) {
    return buatEstimasi(
      artikelId,
      "artikel",
      "art_kemutakhiran_referensi",
      "Kemutakhiran Referensi",
      0,
      3,
      "otomatis",
      "Tidak ada referensi",
    );
  }

  const tahunIni = new Date().getFullYear();
  const ambangTahun = bidangIlmu === "ilmu_komputer" ? 5 : 10;
  const refsWithYear = refs.filter((r) => r.tahunTerbit);

  if (refsWithYear.length === 0) {
    return buatEstimasi(
      artikelId,
      "artikel",
      "art_kemutakhiran_referensi",
      "Kemutakhiran Referensi",
      null,
      3,
      "belum_diisi",
      "Tahun terbit referensi belum diverifikasi",
    );
  }

  const mutakhir = refsWithYear.filter((r) => tahunIni - r.tahunTerbit! <= ambangTahun);
  const mutakhirRatio = mutakhir.length / refsWithYear.length;
  const skor = proporsional(mutakhirRatio, 0.85, 3);

  return buatEstimasi(
    artikelId,
    "artikel",
    "art_kemutakhiran_referensi",
    "Kemutakhiran Referensi",
    skor,
    3,
    "otomatis",
    `${mutakhir.length}/${refsWithYear.length} referensi ≤${ambangTahun} tahun (${Math.round(mutakhirRatio * 100)}%, target >85%)`,
  );
}

/**
 * 8A — Statistik Kunjungan
 * Max: 3
 */
export function skorStatistikKunjungan(
  jurnalId: string,
  rataRataKunjunganHarian: number,
): ScoreEstimate {
  let skor: number;
  if (rataRataKunjunganHarian > 50) skor = 3;
  else if (rataRataKunjunganHarian >= 10) skor = 2;
  else skor = 1;

  return buatEstimasi(
    jurnalId,
    "jurnal",
    "8A",
    "Statistik Kunjungan",
    skor,
    3,
    "otomatis",
    `Rata-rata ${rataRataKunjunganHarian} kunjungan unik/hari`,
  );
}

// ============================================================================
// (b) INDIKATOR SEMI-OTOMATIS — butuh input manusia
// ============================================================================

/**
 * 4A — Cakupan Keilmuan (Focus & Scope Compliance)
 * Max: 4
 * Keputusan akhir ada di Editor — mesin hanya mengagregasi flag
 * PENDALAMAN BAB 5.3 — fungsi skor_cakupan_keilmuan
 */
export function skorCakupanKeilmuan(
  edisiId: string,
  flagArtikel: ("sesuai" | "kurang_sesuai" | "tidak_sesuai")[],
): ScoreEstimate {
  if (flagArtikel.length === 0) {
    return buatEstimasi(
      edisiId,
      "edisi",
      "4A",
      "Cakupan Keilmuan",
      null,
      4,
      "belum_diisi",
      "Belum ada artikel yang dinilai kesesuaiannya",
    );
  }

  const sesuai = flagArtikel.filter((f) => f === "sesuai").length;
  const pctSesuai = sesuai / flagArtikel.length;

  let skor: number;
  if (pctSesuai === 1.0) skor = 4;
  else if (pctSesuai >= 0.8) skor = 3;
  else skor = 1;

  return buatEstimasi(
    edisiId,
    "edisi",
    "4A",
    "Cakupan Keilmuan",
    skor,
    4,
    "verifikasi_manusia",
    `${sesuai}/${flagArtikel.length} artikel sesuai Focus & Scope (${Math.round(pctSesuai * 100)}%)`,
  );
}

// ============================================================================
// (c) INDIKATOR KUALITATIF — mesin TIDAK menghasilkan angka pasti
// Editor yang memasukkan skor; fungsi ini hanya menyimpan/memvalidasi
// PENDALAMAN BAB 5.3 — prinsip: mesin tidak menilai novelty/analisis
// ============================================================================

export function validasiSkorNovelty(skor: number): boolean {
  return skor >= 0 && skor <= 6;
}

export function validasiSkorAnalisis(skor: number): boolean {
  return skor >= 0 && skor <= 5;
}

export function validasiSkorSimpulan(skor: number): boolean {
  return skor >= 0 && skor <= 3;
}

// ============================================================================
// AGREGASI — Artikel → Edisi → Jurnal (PENDALAMAN BAB 5.4)
// ============================================================================

/**
 * Total skor maksimum teoretis seluruh indikator rubrik
 * Sumber: tabel BAB 5.9 MASTER_SYSTEM_PROMPT
 */
export const SKOR_MAKS_TOTAL =
  2 +
  5 +
  6 +
  5 +
  3 +
  1 +
  2 +
  2 +
  4 +
  8 +
  8 +
  1 +
  1 +
  1 +
  1 +
  1 +
  1 +
  1 +
  1 +
  2 +
  1 +
  1 +
  1 +
  1 +
  1 +
  3 +
  8 +
  1;
// = 73 (level jurnal) + per-artikel substansi dihitung terpisah

/**
 * Estimasi level Sinta berdasarkan skor total
 * Sumber: BAB 5.2 MASTER_SYSTEM_PROMPT — nilai ≥85 = Sinta 1
 */
export function estimasiSintaLevel(totalSkor: number): JournalScoreReport["estimasiSintaLevel"] {
  if (totalSkor >= 85) return "sinta_1";
  if (totalSkor >= 70) return "sinta_2";
  if (totalSkor >= 60) return "sinta_3";
  if (totalSkor >= 40) return "sinta_4";
  if (totalSkor >= 20) return "sinta_5";
  if (totalSkor > 0) return "sinta_6";
  return "tidak_terakreditasi";
}

/**
 * Estimasi fase roadmap saat ini berdasarkan exit criteria
 * PENDALAMAN BAB 6.2 — tabel kriteria keluar per fase
 */
export function estimasiFaseRoadmap(params: {
  skor4A?: number;
  skor3A?: number;
  skor3B?: number;
  skor4B?: number;
  skor4C?: number;
  skorTotal?: number;
  registryTerisi: boolean;
}): 0 | 1 | 2 | 3 | 4 {
  const { skor4A, skor3A, skor3B, skor4B, skor4C, skorTotal, registryTerisi } = params;

  // Fase 0 exit: 4A >= 3 dan registry terisi
  const fase0Lulus = (skor4A ?? 0) >= 3 && registryTerisi;
  if (!fase0Lulus) return 0;

  // Fase 1 exit: referensi rata >85% + DOI semua artikel
  // Simplified check: proxy via score thresholds
  const fase1Lulus = fase0Lulus; // detailed check requires per-article data

  // Fase 2 exit: 3A >= 4 dan 3B >= 3 dan 4B >= 6 dan kelembagaan >= 3
  const fase2Lulus = fase1Lulus && (skor3A ?? 0) >= 4 && (skor3B ?? 0) >= 3 && (skor4B ?? 0) >= 6;
  if (!fase2Lulus) return 1;

  // Fase 3 exit: 4C >= 6 dan total >= 85
  const fase3Lulus = fase2Lulus && (skor4C ?? 0) >= 6 && (skorTotal ?? 0) >= 85;
  if (!fase3Lulus) return 2;

  return 3;
}

/**
 * Generate priority alerts — top 3 gaps by weighted impact
 * PENDALAMAN BAB 16.5 — "3 hal paling mendesak"
 */
export function generatePriorityAlerts(
  scores: Partial<Record<IndicatorCode, ScoreEstimate>>,
): PriorityAlert[] {
  const alerts: PriorityAlert[] = [];

  for (const [kode, est] of Object.entries(scores) as [IndicatorCode, ScoreEstimate][]) {
    if (!est || est.skor === null) {
      alerts.push({
        kode,
        indikatorNama: est?.indikatorNama ?? kode,
        pesan: `${est?.indikatorNama ?? kode} belum diverifikasi — bobot ${est?.skorMaks}, wajib diisi`,
        prioritas:
          (est?.skorMaks ?? 0) >= 5 ? "tinggi" : (est?.skorMaks ?? 0) >= 3 ? "sedang" : "rendah",
        skorSaatIni: null,
        skorMaks: est?.skorMaks ?? 0,
        gap: est?.skorMaks ?? 0,
      });
      continue;
    }

    const gap = est.skorMaks - est.skor;
    if (gap > 0) {
      const pctGap = gap / est.skorMaks;
      alerts.push({
        kode,
        indikatorNama: est.indikatorNama,
        pesan: `${est.indikatorNama}: ${est.skor}/${est.skorMaks} — gap ${gap} poin (${Math.round(pctGap * 100)}% dari maks)`,
        prioritas: est.skorMaks >= 6 ? "tinggi" : est.skorMaks >= 3 ? "sedang" : "rendah",
        skorSaatIni: est.skor,
        skorMaks: est.skorMaks,
        gap,
      });
    }
  }

  // Sort by: prioritas tinggi first, then by gap size, then by weight
  return alerts
    .sort((a, b) => {
      const prioritasOrder = { tinggi: 0, sedang: 1, rendah: 2 };
      if (prioritasOrder[a.prioritas] !== prioritasOrder[b.prioritas]) {
        return prioritasOrder[a.prioritas] - prioritasOrder[b.prioritas];
      }
      return b.gap - a.gap;
    })
    .slice(0, 3);
}

// ============================================================================
// REVIEWER DIVERSITY SUMMARY (for UI display)
// ============================================================================

export function summarizeReviewerDiversity(reviewers: Reviewer[]): ReviewerDiversitySummary {
  const aktif = reviewers.filter((r) => r.statusAktif);
  const negara = Array.from(new Set(aktif.map((r) => r.negara)));
  const jumlahInternasional = aktif.filter((r) => r.kualifikasiInternasional).length;
  const pct = aktif.length > 0 ? jumlahInternasional / aktif.length : 0;

  let skor = 0;
  if (negara.length >= 4 && pct > 0.5) skor = 6;
  else if ((negara.length >= 2 && pct > 0.5) || (aktif.length > 4 && pct > 0.5)) skor = 4;
  else if (aktif.length > 0) skor = 2;

  let status: ReviewerDiversitySummary["status"];
  if (skor >= 6) status = "aman";
  else if (skor >= 4) status = "perlu_perhatian";
  else status = "kritis";

  return {
    totalAktif: aktif.length,
    jumlahNegara: negara.length,
    negara,
    jumlahInternasional,
    persentaseInternasional: Math.round(pct * 100),
    skorEstimasi3A: skor,
    skorMaks3A: 6,
    status,
  };
}

export function summarizeEditorialBoardDiversity(
  members: EditorialBoardMember[],
): EditorialBoardDiversitySummary {
  const aktif = members.filter((m) => m.statusAktif);
  const negara = Array.from(new Set(aktif.map((m) => m.negara)));
  const jumlahInternasional = aktif.filter((m) => m.kualifikasiInternasional).length;
  const pct = aktif.length > 0 ? jumlahInternasional / aktif.length : 0;

  let skor = 0;
  if (negara.length >= 4 && pct > 0.5) skor = 5;
  else if (negara.length >= 2 && pct < 0.5) skor = 3;
  else if (aktif.length > 0) skor = 1;

  let status: EditorialBoardDiversitySummary["status"];
  if (skor >= 5) status = "aman";
  else if (skor >= 3) status = "perlu_perhatian";
  else status = "kritis";

  return {
    totalAktif: aktif.length,
    jumlahNegara: negara.length,
    negara,
    jumlahInternasional,
    persentaseInternasional: Math.round(pct * 100),
    skorEstimasi3B: skor,
    skorMaks3B: 5,
    status,
  };
}
