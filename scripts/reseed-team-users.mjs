import { createClient } from "@supabase/supabase-js";
import * as crypto from "crypto";

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

function generateStrongPassword(length = 14) {
  const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // No O, I
  const lowers = "abcdefghijkmnpqrstuvwxyz"; // No l
  const numbers = "23456789";                 // No 0, 1
  const symbols = "!@#$%^&*";
  const all = uppers + lowers + numbers + symbols;

  let password = "";
  password += uppers[crypto.randomInt(uppers.length)];
  password += lowers[crypto.randomInt(lowers.length)];
  password += numbers[crypto.randomInt(numbers.length)];
  password += symbols[crypto.randomInt(symbols.length)];

  for (let i = 4; i < length; i++) {
    password += all[crypto.randomInt(all.length)];
  }

  // Shuffle string
  return password.split("").sort(() => Math.random() - 0.5).join("");
}

const teamMembers = [
  // Section Editors
  { fullName: "Irsad Tio Majid, S.Si.", email: "irsad.majid@risenologi.kpmunj.org", role: "editor" },
  { fullName: "Ahmad Rizky Farhan, S.Hum.", email: "ahmad.farhan@risenologi.kpmunj.org", role: "editor" },
  { fullName: "Chika Shafa Maura, S.Si.", email: "chika.maura@risenologi.kpmunj.org", role: "editor" },
  { fullName: "Helga Gustian, S.Pd.", email: "helga.gustian@risenologi.kpmunj.org", role: "editor" },
  { fullName: "Iif Ahmad Rifa'i, S.Pd.", email: "iif.rifai@risenologi.kpmunj.org", role: "editor" },
  { fullName: "Milayda Samsu, S.Si.", email: "milayda.samsu@risenologi.kpmunj.org", role: "editor" },
  { fullName: "Muhammad Abdurrahman Ihsan, S.Pd.", email: "abdurrahman.ihsan@risenologi.kpmunj.org", role: "editor" },
  { fullName: "Putri Rachman Fastya, S.Pd.", email: "putri.fastya@risenologi.kpmunj.org", role: "editor" },

  // Journal Managers
  { fullName: "Aisyah Fitriani", email: "aisyah.fitriani@risenologi.kpmunj.org", role: "journal_manager" },
  { fullName: "Amanda Nurifa", email: "amanda.nurifa@risenologi.kpmunj.org", role: "journal_manager" },
  { fullName: "Gabriela Amelia Desianta Munthe", email: "gabriela.munthe@risenologi.kpmunj.org", role: "journal_manager" },
  { fullName: "Michael Kurniawan Santosa", email: "michael.santosa@risenologi.kpmunj.org", role: "journal_manager" },
  { fullName: "Bayu Saputra", email: "bayu.saputra@risenologi.kpmunj.org", role: "journal_manager" },
  { fullName: "Aulia Nur Fadhillah", email: "aulia.fadhillah@risenologi.kpmunj.org", role: "journal_manager" },
  { fullName: "Navisha Anggraini", email: "navisha.anggraini@risenologi.kpmunj.org", role: "journal_manager" },
  { fullName: "Alfian Miftahurrizki", email: "alfian.miftahurrizki@risenologi.kpmunj.org", role: "journal_manager" },
  { fullName: "Ivan Juansyah", email: "ivan.juansyah@risenologi.kpmunj.org", role: "journal_manager" },
  { fullName: "Nur Aini", email: "nur.aini@risenologi.kpmunj.org", role: "journal_manager" },
  { fullName: "Saybia Fayray Tabitha", email: "saybia.tabitha@risenologi.kpmunj.org", role: "journal_manager" },
  { fullName: "Raisa Ayaka Ramadhani", email: "raisa.ramadhani@risenologi.kpmunj.org", role: "journal_manager" },
];

async function seed() {
  console.log("Creating/updating 20 team users with @risenologi.kpmunj.org domain & strong random passwords...\n");

  const results = [];

  for (const m of teamMembers) {
    const password = generateStrongPassword(14);
    
    // Check if user already exists
    const { data: searchData } = await supabase.auth.admin.listUsers();
    let existingUser = searchData?.users?.find(u => u.email === m.email);

    let userId = existingUser?.id;

    if (existingUser) {
      // Update password
      const { error: updateErr } = await supabase.auth.admin.updateUserById(existingUser.id, {
        password: password,
        email_confirm: true,
        user_metadata: { full_name: m.fullName }
      });
      if (updateErr) {
        console.error(`❌ Failed to update password for ${m.email}:`, updateErr.message);
      }
    } else {
      // Create user
      const { data: createData, error: createErr } = await supabase.auth.admin.createUser({
        email: m.email,
        password: password,
        email_confirm: true,
        user_metadata: { full_name: m.fullName }
      });
      if (createErr) {
        console.error(`❌ Failed to create user ${m.email}:`, createErr.message);
        continue;
      }
      userId = createData?.user?.id;
    }

    if (userId) {
      // Upsert user_profiles
      const { error: profErr } = await supabase.from("user_profiles").upsert({
        id: userId,
        full_name: m.fullName,
        role: m.role,
        updated_at: new Date().toISOString()
      });

      if (profErr) {
        console.error(`❌ Failed profile for ${m.email}:`, profErr.message);
      } else {
        console.log(`✅ Processed: ${m.fullName} | ${m.email}`);
        results.push({
          fullName: m.fullName,
          email: m.email,
          role: m.role,
          password: password
        });
      }
    }
  }

  console.log("\n============================================================");
  console.log("RESULTS JSON:");
  console.log(JSON.stringify(results, null, 2));
  console.log("============================================================");
}

seed().catch(console.error);
