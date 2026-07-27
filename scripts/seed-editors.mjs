import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

const editorsData = [
  // 6 Academic / Senior Editors (Instansi: Universitas Negeri Jakarta) - tanpa NIP
  {
    nama: "Taryudi, Ph.D.",
    jabatan: "Editor",
    afiliasi: "Universitas Negeri Jakarta (UNJ)",
    email: "taryudi@unj.ac.id",
    negara: "ID",
    kualifikasi_internasional: true,
    status_aktif: true,
  },
  {
    nama: "Dr. Nur’aeni Marta, S.S., M.Hum.",
    jabatan: "Editor",
    afiliasi: "Universitas Negeri Jakarta (UNJ)",
    email: "nuraeni.marta@unj.ac.id",
    negara: "ID",
    kualifikasi_internasional: false,
    status_aktif: true,
  },
  {
    nama: "Muh. Takdir, M.Pd.",
    jabatan: "Editor",
    afiliasi: "Universitas Negeri Jakarta (UNJ)",
    email: "muh.takdir@unj.ac.id",
    negara: "ID",
    kualifikasi_internasional: false,
    status_aktif: true,
  },
  {
    nama: "Fauzi Bakri, M.Si.",
    jabatan: "Editor",
    afiliasi: "Universitas Negeri Jakarta (UNJ)",
    email: "fauzi.bakri@unj.ac.id",
    negara: "ID",
    kualifikasi_internasional: false,
    status_aktif: true,
  },
  {
    nama: "Imam Nursyahied, S.Pd., M.Pd.",
    jabatan: "Editor",
    afiliasi: "Universitas Negeri Jakarta (UNJ)",
    email: "imam.nursyahied@unj.ac.id",
    negara: "ID",
    kualifikasi_internasional: false,
    status_aktif: true,
  },
  {
    nama: "Sigit Pramono, S.S., M.Hum.",
    jabatan: "Editor",
    afiliasi: "Universitas Negeri Jakarta (UNJ)",
    email: "sigit.pramono@unj.ac.id",
    negara: "ID",
    kualifikasi_internasional: false,
    status_aktif: true,
  },

  // 8 Section Editors
  {
    nama: "Irsad Tio Majid, S.Si.",
    jabatan: "Section Editor",
    afiliasi: "Jurnal Risenologi - KPM UNJ",
    email: "irsad.majid@risenologi.kpmunj.org",
    negara: "ID",
    kualifikasi_internasional: false,
    status_aktif: true,
  },
  {
    nama: "Ahmad Rizky Farhan, S.Hum.",
    jabatan: "Section Editor",
    afiliasi: "Jurnal Risenologi - KPM UNJ",
    email: "ahmad.farhan@risenologi.kpmunj.org",
    negara: "ID",
    kualifikasi_internasional: false,
    status_aktif: true,
  },
  {
    nama: "Chika Shafa Maura, S.Si.",
    jabatan: "Section Editor",
    afiliasi: "Jurnal Risenologi - KPM UNJ",
    email: "chika.maura@risenologi.kpmunj.org",
    negara: "ID",
    kualifikasi_internasional: false,
    status_aktif: true,
  },
  {
    nama: "Helga Gustian, S.Pd.",
    jabatan: "Section Editor",
    afiliasi: "Jurnal Risenologi - KPM UNJ",
    email: "helga.gustian@risenologi.kpmunj.org",
    negara: "ID",
    kualifikasi_internasional: false,
    status_aktif: true,
  },
  {
    nama: "Iif Ahmad Rifa'i, S.Pd.",
    jabatan: "Section Editor",
    afiliasi: "Jurnal Risenologi - KPM UNJ",
    email: "iif.rifai@risenologi.kpmunj.org",
    negara: "ID",
    kualifikasi_internasional: false,
    status_aktif: true,
  },
  {
    nama: "Milayda Samsu, S.Si.",
    jabatan: "Section Editor",
    afiliasi: "Jurnal Risenologi - KPM UNJ",
    email: "milayda.samsu@risenologi.kpmunj.org",
    negara: "ID",
    kualifikasi_internasional: false,
    status_aktif: true,
  },
  {
    nama: "Muhammad Abdurrahman Ihsan, S.Pd.",
    jabatan: "Section Editor",
    afiliasi: "Jurnal Risenologi - KPM UNJ",
    email: "abdurrahman.ihsan@risenologi.kpmunj.org",
    negara: "ID",
    kualifikasi_internasional: false,
    status_aktif: true,
  },
  {
    nama: "Putri Rachman Fastya, S.Pd.",
    jabatan: "Section Editor",
    afiliasi: "Jurnal Risenologi - KPM UNJ",
    email: "putri.fastya@risenologi.kpmunj.org",
    negara: "ID",
    kualifikasi_internasional: false,
    status_aktif: true,
  },
];

async function runSeed() {
  console.log("🚀 Starting Clean Editor Registry Update (No NIP)...\n");

  const { data: journal } = await supabase.from("journals").select("id").limit(1).single();
  const journalId = journal?.id;

  if (!journalId) {
    console.error("❌ Journal not found in database.");
    process.exit(1);
  }

  // Delete existing records to clean up NIP entries
  await supabase.from("editorial_board_members").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  let countMembers = 0;

  for (const ed of editorsData) {
    const { error } = await supabase.from("editorial_board_members").insert({
      journal_id: journalId,
      nama: ed.nama,
      jabatan: ed.jabatan,
      afiliasi: ed.afiliasi,
      email: ed.email,
      negara: ed.negara,
      kualifikasi_internasional: ed.kualifikasi_internasional,
      status_aktif: ed.status_aktif,
    });

    if (error) {
      console.warn(`Warning inserting ${ed.nama}:`, error.message);
    } else {
      countMembers++;
    }
  }

  console.log(`✅ Successfully updated ${countMembers} clean editor entries (without NIP)!`);
  console.log(`🎉 Editor Registry Cleaned & Updated!`);
}

runSeed();
