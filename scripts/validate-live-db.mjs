import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function validateDb() {
  console.log("=================================================");
  console.log("🔍 VALIDASI DATA REAL SUPABASE DB — JURNAL RISENOLOGI");
  console.log("=================================================\n");

  // 1. Journals
  const { data: journal } = await supabase.from("journals").select("*").limit(1).single();
  console.log("1. DATA JURNAL (`journals`):");
  console.log(`   - Nama: "${journal?.nama}"`);
  console.log(`   - Penerbit: "${journal?.penerbit}"`);
  console.log(`   - Status Sinta DB: "${journal?.status_sinta}"`);
  console.log(`   - ISSN: p-ISSN ${journal?.p_issn} / e-ISSN ${journal?.e_issn}\n`);

  // 2. Desk Evaluation Checks
  const { data: deskEval } = await supabase.from("desk_evaluation_checks").select("*").limit(1).single();
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
  console.log("2. DATA DESK EVALUATION (`desk_evaluation_checks`):");
  console.log(`   - Item Terpenuhi: ${passedDesk}/8 Item`);
  console.log(`   - Status Lulus: ${passedDesk === 8 ? "LULUS (100%)" : "TIDAK LULUS"}\n`);

  // 3. Reviewers
  const { data: reviewers } = await supabase.from("reviewers").select("*");
  const revList = reviewers || [];
  const revCountries = Array.from(new Set(revList.map((r) => r.negara).filter(Boolean)));
  const intlRev = revList.filter((r) => r.kualifikasi_internasional || (r.negara && r.negara !== "Indonesia")).length;
  console.log("3. DATA MITRA BESTARI (`reviewers`):");
  console.log(`   - Total Reviewer di DB: ${revList.length} orang`);
  console.log(`   - Jumlah Negara: ${revCountries.length} (${revCountries.join(", ")})`);
  console.log(`   - Kualifikasi Internasional: ${intlRev} orang (${revList.length > 0 ? Math.round((intlRev / revList.length) * 100) : 0}%)\n`);

  // 4. Editorial Board
  const { data: edBoard } = await supabase.from("editorial_board_members").select("*");
  const edList = edBoard || [];
  const edCountries = Array.from(new Set(edList.map((e) => e.negara).filter(Boolean)));
  const intlEd = edList.filter((e) => e.negara && e.negara !== "Indonesia").length;
  console.log("4. DATA DEWAN PENYUNTING (`editorial_board_members`):");
  console.log(`   - Total Editor di DB: ${edList.length} orang`);
  console.log(`   - Jumlah Negara: ${edCountries.length} (${edCountries.join(", ")})`);
  console.log(`   - Kualifikasi Internasional: ${intlEd} orang\n`);

  // 5. Articles & DOI
  const { data: articles } = await supabase.from("articles").select("*");
  const artList = articles || [];
  const artDoi = artList.filter((a) => a.doi && a.doi.trim().length > 0);
  console.log("5. DATA ARTIKEL & DOI (`articles`):");
  console.log(`   - Total Artikel di DB: ${artList.length} artikel`);
  console.log(`   - Memiliki DOI Aktif: ${artDoi.length} artikel (${artList.length > 0 ? Math.round((artDoi.length / artList.length) * 100) : 0}%)\n`);

  // 6. Article Authors
  const { data: authors } = await supabase.from("article_authors").select("*");
  const authorList = authors || [];
  const authorCountries = Array.from(new Set(authorList.map((a) => a.negara).filter(Boolean)));
  console.log("6. DATA PENULIS ARTIKEL (`article_authors`):");
  console.log(`   - Total Penulis Terdata: ${authorList.length} orang`);
  console.log(`   - Jumlah Asal Negara: ${authorCountries.length} (${authorCountries.join(", ")})\n`);

  // 7. Editions
  const { data: editions } = await supabase.from("editions").select("*");
  console.log("7. DATA EDISI TERBITAN (`editions`):");
  console.log(`   - Total Edisi di DB: ${editions?.length || 0} edisi terbitan\n`);

  console.log("=================================================");
}

validateDb();
