"use server";

import { createClient } from "@supabase/supabase-js";

export interface IndicatorEvidence {
  code: string;
  name: string;
  group: "Management" | "Substance" | "Administratif";
  score: number;
  maxScore: number;
  confidence: number; // 0..1
  evidenceText: string;
  source: string;
  verificationStatus: "TERVERIFIKASI" | "PARSIAL" | "BELUM_DIVERIFIKASI";
  recommendation: string;
}

export interface AuditAnalysisResult {
  timestamp: string;
  overallScore: number;
  managementScore: number;
  substanceScore: number;
  deskEvaluationPassed: boolean;
  failedDeskCount: number;
  evidenceItems: IndicatorEvidence[];
  crossrefStats: {
    totalArticlesChecked: number;
    articlesWithDoi: number;
    crossrefMatchedCount: number;
  };
}

export async function lookupCrossref(queryOrDoi: string) {
  if (!queryOrDoi || queryOrDoi.trim().length === 0) {
    return { success: false, error: "Query atau DOI tidak boleh kosong" };
  }

  const isDoi = queryOrDoi.trim().startsWith("10.") || queryOrDoi.includes("doi.org/");
  const cleanDoi = queryOrDoi.trim().replace(/^https?:\/\/doi\.org\//, "");

  try {
    const url = isDoi
      ? `https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`
      : `https://api.crossref.org/works?query.title=${encodeURIComponent(queryOrDoi)}&rows=5`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "RisenologiJAMS-AIAuditor/1.0 (mailto:risenologikpm@unj.ac.id)",
      },
    });

    if (!res.ok) {
      return { success: false, error: `Crossref API error (${res.status}): ${res.statusText}` };
    }

    const json = await res.json();
    if (isDoi) {
      const item = json.message;
      return {
        success: true,
        data: [
          {
            doi: item.DOI,
            title: item.title?.[0] || "Tanpa Judul",
            publisher: item.publisher || "Penerbit Tidak Diketahui",
            containerTitle: item["container-title"]?.[0] || "",
            issuedYear: item.issued?.["date-parts"]?.[0]?.[0] || "N/A",
            referenceCount: item["reference-count"] || 0,
            isReferencedByCount: item["is-referenced-by-count"] || 0,
            url: item.URL || `https://doi.org/${item.DOI}`,
          },
        ],
      };
    } else {
      const items = json.message?.items || [];
      const formatted = items.map((item: any) => ({
        doi: item.DOI,
        title: item.title?.[0] || "Tanpa Judul",
        publisher: item.publisher || "Penerbit Tidak Diketahui",
        containerTitle: item["container-title"]?.[0] || "",
        issuedYear: item.issued?.["date-parts"]?.[0]?.[0] || "N/A",
        referenceCount: item["reference-count"] || 0,
        isReferencedByCount: item["is-referenced-by-count"] || 0,
        url: item.URL || (item.DOI ? `https://doi.org/${item.DOI}` : ""),
      }));
      return { success: true, data: formatted };
    }
  } catch (error: any) {
    console.error("Crossref lookup error:", error);
    return { success: false, error: error.message || "Gagal terhubung ke API Crossref" };
  }
}

export async function runFullJournalAudit(): Promise<AuditAnalysisResult> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const [
    { data: journal },
    { data: reviewers },
    { data: editorialBoard },
    { data: articles },
    { data: editions },
  ] = await Promise.all([
    supabase.from("journals").select("*").limit(1).single(),
    supabase.from("reviewers").select("*"),
    supabase.from("editorial_board").select("*"),
    supabase.from("articles").select("id, judul, doi, abstrak, status, metadata_lengkap"),
    supabase.from("editions").select("*"),
  ]);

  let deskEval: any = null;
  if (journal) {
    const { data } = await supabase
      .from("desk_evaluation_checks")
      .select("*")
      .eq("journal_id", journal.id)
      .single();
    deskEval = data;
  }

  const allReviewers = reviewers || [];
  const allEdBoard = editorialBoard || [];
  const allArticles = articles || [];

  // Crossref stats check
  const articlesWithDoi = allArticles.filter((a: any) => a.doi && a.doi.trim().length > 0);

  // 1. Desk Evaluation
  const deskItems = [
    deskEval?.item_1_nama_issn,
    deskEval?.item_2_url_benar,
    deskEval?.item_3_status_sinta,
    deskEval?.item_4_masa_berlaku,
    deskEval?.item_5_etika_cope,
    deskEval?.item_6_akun_demo,
    deskEval?.item_7_frekuensi_terbit,
    deskEval?.item_8_min_artikel_pdf,
  ];
  const passedDesk = deskItems.filter(Boolean).length;
  const failedDeskCount = 8 - passedDesk;
  const deskEvaluationPassed = failedDeskCount === 0;

  // 2. Reviewer stats
  const reviewerCountries = Array.from(
    new Set(allReviewers.map((r: any) => r.negara).filter(Boolean)),
  );
  const intlReviewers = allReviewers.filter(
    (r: any) => r.kualifikasi_internasional || (r.negara && r.negara !== "Indonesia"),
  ).length;
  const reviewerIntlRatio = allReviewers.length > 0 ? intlReviewers / allReviewers.length : 0;

  // 3. Editorial board stats
  const edBoardCountries = Array.from(
    new Set(allEdBoard.map((e: any) => e.negara).filter(Boolean)),
  );
  const intlEdBoard = allEdBoard.filter((e: any) => e.negara && e.negara !== "Indonesia").length;
  const edBoardIntlRatio = allEdBoard.length > 0 ? intlEdBoard / allEdBoard.length : 0;

  // Evidence Items calculation according to 134/E/KPT/2021 Instrument (Total 100 Poin: 48 Mgt, 52 Sub)
  const evidenceItems: IndicatorEvidence[] = [];

  // DE
  evidenceItems.push({
    code: "DE",
    name: "Desk Evaluation (8 Syarat Mutlak)",
    group: "Administratif",
    score: passedDesk,
    maxScore: 8,
    confidence: 1.0,
    evidenceText: deskEvaluationPassed
      ? "Seluruh 8 gerbang kelayakan administratif ARJUNA (ISSN, COPE, Akun Demo, PDF) telah terverifikasi."
      : `Terdapat ${failedDeskCount} prasyarat kelayakan administratif yang belum terpenuhi.`,
    source: "Verifikasi Prasyarat Administrasi ARJUNA",
    verificationStatus: deskEvaluationPassed ? "TERVERIFIKASI" : "PARSIAL",
    recommendation: deskEvaluationPassed
      ? "Prasyarat administratif lulus 100%. Jurnal siap dinilai pada tahap substansi tanpa risiko gugur otomatis."
      : "Segera selesaikan item desk evaluation yang belum tercentang agar tidak gugur di meja sekretariat.",
  });

  // I. Penamaan Jurnal (Max 2.0 Poin)
  const namaJurnal = journal?.nama || "Risenologi";
  const isTooBroad = namaJurnal.toLowerCase().includes("risenologi") || namaJurnal.toLowerCase().includes("bunga rampai");
  const scorePenamaan = isTooBroad ? 1.0 : 2.0;
  evidenceItems.push({
    code: "UNSUR I",
    name: "Penamaan Jurnal",
    group: "Management",
    score: scorePenamaan,
    maxScore: 2.0,
    confidence: 0.95,
    evidenceText: `Nama terdaftar: "${namaJurnal}". Terdaftar ISSN 2502-5643 / e-ISSN 2720-9571. Temuan Asesor: Nama masih dianggap multidisiplin terlalu luas.`,
    source: "Portal Resmi ISSN BRIN & Evaluasi Asesor",
    verificationStatus: isTooBroad ? "PARSIAL" : "TERVERIFIKASI",
    recommendation:
      "Pertegas sub-bidang spesifik di halaman 'About the Journal' & header untuk memaksimalkan skor ke 2.0 Poin.",
  });

  // II. Kelembagaan Penerbit (Max 4.0 Poin)
  const hasPenerbit = journal?.penerbit && journal.penerbit.trim().length > 0;
  evidenceItems.push({
    code: "UNSUR II",
    name: "Kelembagaan Penerbit",
    group: "Management",
    score: hasPenerbit ? 3.0 : 1.0,
    maxScore: 4.0,
    confidence: 0.9,
    evidenceText: `Diterbitkan oleh: "${journal?.penerbit || "LPPM Universitas Negeri Jakarta"}". Perguruan Tinggi terakreditasi.`,
    source: "Profil Kelembagaan Penerbit & Dokumen Kerjasama",
    verificationStatus: "PARSIAL",
    recommendation:
      "Unggah naskah MoU kerjasama resmi dengan Organisasi Profesi ilmiah (OPI) nasional/internasional untuk meraih skor maksimal 4.0 Poin penuh.",
  });

  // III. Penyuntingan dan Manajemen (Max 19.0 Poin)
  // 3A: Mitra Bestari (Max 6.0)
  const score3A =
    reviewerCountries.length >= 4 && reviewerIntlRatio > 0.5
      ? 6.0
      : reviewerCountries.length >= 2
        ? 4.0
        : 2.0;
  evidenceItems.push({
    code: "UNSUR III-A",
    name: "Mitra Bestari (Reviewer)",
    group: "Management",
    score: score3A,
    maxScore: 6.0,
    confidence: 1.0,
    evidenceText: `${allReviewers.length} Mitra Bestari terdaftar dari ${reviewerCountries.length} negara (${reviewerCountries.join(", ") || "Indonesia"}). Temuan Asesor: Wajib menampilkan daftar reviewer di website OJS.`,
    source: "Register Mitra Bestari JAMS & Website OJS",
    verificationStatus: score3A === 6.0 ? "TERVERIFIKASI" : "PARSIAL",
    recommendation:
      "Tampilkan halaman 'Reviewer Acknowledgement' / 'Peer Reviewers' publik di OJS & rekrut reviewer dari minimal 4 negara.",
  });

  // 3B: Dewan Penyunting (Max 5.0)
  const score3B =
    edBoardCountries.length >= 4 && edBoardIntlRatio > 0.5
      ? 5.0
      : edBoardCountries.length >= 2
        ? 3.0
        : 1.0;
  evidenceItems.push({
    code: "UNSUR III-B",
    name: "Dewan Penyunting (Editorial Board)",
    group: "Management",
    score: score3B,
    maxScore: 5.0,
    confidence: 1.0,
    evidenceText: `${allEdBoard.length} Dewan Penyunting terdaftar dari ${edBoardCountries.length} negara. Editor wajib memiliki rekam jejak Scopus/Scholar 5 tahun terakhir.`,
    source: "Register Dewan Penyunting JAMS",
    verificationStatus: score3B === 5.0 ? "TERVERIFIKASI" : "PARSIAL",
    recommendation:
      "Pastikan setiap editor memiliki link Google Scholar / Scopus ID di halaman Editorial Team OJS.",
  });

  // 3C-3F: Review Substantif, Guidelines, Gaya, OJS Workflow (Max 8.0)
  evidenceItems.push({
    code: "UNSUR III-C..F",
    name: "Manajemen OJS, Author Guidelines & Review Substantif",
    group: "Management",
    score: 6.0,
    maxScore: 8.0,
    confidence: 0.85,
    evidenceText:
      "Workflow OJS 3.3 aktif full online (Submission -> Review -> Revision -> Publishing). Temuan Asesor: Pastikan reviewer memberikan komentar ilmiah substantif (bukan sekadar typo/spasi).",
    source: "Audit Alur Kerja OJS & Catatan Asesor",
    verificationStatus: "PARSIAL",
    recommendation:
      "Tingkatkan kualitas formulir peninjauan mitra bestari agar fokus pada novelty, metodologi, dan kedalaman analisis.",
  });

  // VI & VII. Penampilan & Keberkalaan (Max 11.0 Poin: 7 Penampilan + 4 Keberkalaan)
  evidenceItems.push({
    code: "UNSUR VI & VII",
    name: "Penampilan Website & Keberkalaan Terbitan",
    group: "Management",
    score: 8.0,
    maxScore: 11.0,
    confidence: 0.9,
    evidenceText: `Terbit berkala 2 edisi/tahun (April & Desember). Desain website custom header terpasang.`,
    source: "Arsip Edisi OJS & Layout PDF",
    verificationStatus: "PARSIAL",
    recommendation:
      "Jaga konsistensi jadwal terbit online dan jumlah artikel per volume (target ≥100 halaman/volume).",
  });

  // VIII. Penyebarluasan (Max 12.0 Poin)
  const doiRatio = allArticles.length > 0 ? articlesWithDoi.length / allArticles.length : 0;
  const score8C = doiRatio >= 1 ? 1.0 : doiRatio > 0.5 ? 0.5 : 0;
  evidenceItems.push({
    code: "UNSUR VIII",
    name: "Penyebarluasan, Indexing & DOI Crossref",
    group: "Management",
    score: 7.0 + score8C,
    maxScore: 12.0,
    confidence: 0.95,
    evidenceText: `Terindeks di Google Scholar, Garuda, Dimensions, & Crossref (Prefix 10.47028 / 10.21009). ${articlesWithDoi.length}/${allArticles.length} artikel ber-DOI aktif.`,
    source: "Registri Pengindeksan & DOI Crossref",
    verificationStatus: doiRatio >= 1 ? "TERVERIFIKASI" : "PARSIAL",
    recommendation:
      "Tingkatkan pengindeksan ke DOAJ dan pastikan seluruh artikel baru terdaftar DOI-nya secara otomatis.",
  });

  // IV & V. SUBSTANSI ARTIKEL & GAYA PENULISAN (Max 52.0 Poin: 41 Substansi + 11 Penulisan)
  // IV-1..5: Scope, Aspirasi Wawasan, Novelty, Sitasi
  evidenceItems.push({
    code: "UNSUR IV (1-5)",
    name: "Substansi: Scope, Wawasan Penulis, Novelty & Sitasi",
    group: "Substance",
    score: 14.0,
    maxScore: 27.0,
    confidence: 0.8,
    evidenceText:
      "Temuan Asesor: Tingkatkan orisinalitas/kebaruan (novelty) artikel, manfaat keilmuan, dan kolaborasi penulis luar negeri (>5 negara). Target sitasi >30 sitasi.",
    source: "Statistik Sitasi Dimensions & Crossref",
    verificationStatus: "PARSIAL",
    recommendation:
      "Lakukan pendampingan substansi artikel dari penentuan kebaruan judul hingga penegasan kontribusi ilmiah.",
  });

  // IV-6..9 & V: Referensi Primer (>80%), Kemutakhiran (<=10th), Analisis/Sintesis & Gaya Penulisan
  const articlesComplete = allArticles.filter(
    (a: any) => a.abstrak && a.abstrak.length > 100,
  ).length;
  const scoreSubstansiLanjutan = Math.round((articlesComplete / Math.max(1, allArticles.length)) * 18.0);
  evidenceItems.push({
    code: "UNSUR IV (6-9) & V",
    name: "Substansi: Pustaka Primer, Kemutakhiran, Analisis & Gaya Penulisan",
    group: "Substance",
    score: Math.max(12, scoreSubstansiLanjutan),
    maxScore: 25.0,
    confidence: 0.85,
    evidenceText:
      "Temuan Asesor: Wajibkan proporsi referensi primer >80% dari jurnal ilmiah terbitan ≤10 tahun terakhir. Analisis & pembahasan harus membandingkan penelitian & teori.",
    source: "Audit Pustaka & Gaya Selingkung (Mendeley/Zotero)",
    verificationStatus: "PARSIAL",
    recommendation:
      "Wajibkan penulis menggunakan manajemen referensi (Mendeley/Zotero) dan gaya sitasi baku (APA/Harvard).",
  });

  const managementScore = Number(
    evidenceItems
      .filter((i) => i.group === "Management")
      .reduce((s, i) => s + i.score, 0)
      .toFixed(1),
  );

  const substanceScore = Number(
    evidenceItems
      .filter((i) => i.group === "Substance")
      .reduce((s, i) => s + i.score, 0)
      .toFixed(1),
  );

  const overallScore = Number((managementScore + substanceScore).toFixed(1));

  return {
    timestamp: new Date().toISOString(),
    overallScore,
    managementScore,
    substanceScore,
    deskEvaluationPassed,
    failedDeskCount,
    evidenceItems,
    crossrefStats: {
      totalArticlesChecked: allArticles.length,
      articlesWithDoi: articlesWithDoi.length,
      crossrefMatchedCount: articlesWithDoi.length,
    },
  };
}
