import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const teamUsers = [
  // Section Editors (role: editor)
  { fullName: "Irsad Tio Majid, S.Si.", email: "irsad.majid@risenologi.id", password: "Password123!", role: "editor" },
  { fullName: "Ahmad Rizky Farhan, S.Hum.", email: "ahmad.farhan@risenologi.id", password: "Password123!", role: "editor" },
  { fullName: "Chika Shafa Maura, S.Si.", email: "chika.maura@risenologi.id", password: "Password123!", role: "editor" },
  { fullName: "Helga Gustian, S.Pd.", email: "helga.gustian@risenologi.id", password: "Password123!", role: "editor" },
  { fullName: "Iif Ahmad Rifa'i, S.Pd.", email: "iif.rifai@risenologi.id", password: "Password123!", role: "editor" },
  { fullName: "Milayda Samsu, S.Si.", email: "milayda.samsu@risenologi.id", password: "Password123!", role: "editor" },
  { fullName: "Muhammad Abdurrahman Ihsan, S.Pd.", email: "abdurrahman.ihsan@risenologi.id", password: "Password123!", role: "editor" },
  { fullName: "Putri Rachman Fastya, S.Pd.", email: "putri.fastya@risenologi.id", password: "Password123!", role: "editor" },

  // Journal Managers (role: journal_manager)
  { fullName: "Aisyah Fitriani", email: "aisyah.fitriani@risenologi.id", password: "Password123!", role: "journal_manager" },
  { fullName: "Amanda Nurifa", email: "amanda.nurifa@risenologi.id", password: "Password123!", role: "journal_manager" },
  { fullName: "Gabriela Amelia Desianta Munthe", email: "gabriela.munthe@risenologi.id", password: "Password123!", role: "journal_manager" },
  { fullName: "Michael Kurniawan Santosa", email: "michael.santosa@risenologi.id", password: "Password123!", role: "journal_manager" },
  { fullName: "Bayu Saputra", email: "bayu.saputra@risenologi.id", password: "Password123!", role: "journal_manager" },
  { fullName: "Aulia Nur Fadhillah", email: "aulia.fadhillah@risenologi.id", password: "Password123!", role: "journal_manager" },
  { fullName: "Navisha Anggraini", email: "navisha.anggraini@risenologi.id", password: "Password123!", role: "journal_manager" },
  { fullName: "Alfian Miftahurrizki", email: "alfian.miftahurrizki@risenologi.id", password: "Password123!", role: "journal_manager" },
  { fullName: "Ivan Juansyah", email: "ivan.juansyah@risenologi.id", password: "Password123!", role: "journal_manager" },
  { fullName: "Nur Aini", email: "nur.aini@risenologi.id", password: "Password123!", role: "journal_manager" },
  { fullName: "Saybia Fayray Tabitha", email: "saybia.tabitha@risenologi.id", password: "Password123!", role: "journal_manager" },
  { fullName: "Raisa Ayaka Ramadhani", email: "raisa.ramadhani@risenologi.id", password: "Password123!", role: "journal_manager" },
];

async function seed() {
  console.log("Seeding 20 editorial team users into Supabase Auth & user_profiles...\n");

  let successCount = 0;

  for (const u of teamUsers) {
    // 1. Create in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.fullName }
    });

    let userId = authData?.user?.id;

    if (authError) {
      if (
        authError.message.includes("already been registered") ||
        authError.message.includes("already registered")
      ) {
        console.log(`ℹ️ User ${u.email} already registered in Auth. Fetching user ID...`);
      } else {
        console.error(`❌ Error creating auth user ${u.email}:`, authError.message);
        continue;
      }
    }

    if (!userId) {
      const { data: searchData } = await supabase.auth.admin.listUsers();
      userId = searchData?.users?.find((user) => user.email === u.email)?.id;
    }

    if (!userId) {
      console.error(`❌ Could not determine user ID for ${u.email}`);
      continue;
    }

    // 2. Upsert into user_profiles
    const { error: profileError } = await supabase.from("user_profiles").upsert({
      id: userId,
      full_name: u.fullName,
      role: u.role,
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error(`❌ Error creating profile for ${u.email}:`, profileError.message);
    } else {
      console.log(`✅ Seeded: ${u.fullName} <${u.email}> (${u.role})`);
      successCount++;
    }
  }

  console.log(`\n🎉 Done! Seeded ${successCount}/${teamUsers.length} users.`);
}

seed().catch(console.error);
