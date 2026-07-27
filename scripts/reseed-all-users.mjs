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
  const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowers = "abcdefghijkmnpqrstuvwxyz";
  const numbers = "23456789";
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

  return password.split("").sort(() => Math.random() - 0.5).join("");
}

const adminAccount = {
  fullName: "Super Administrator JAMS",
  email: "admin@risenologi.kpmunj.org",
  role: "administrator",
  password: "AdminSuperJAMS2026!#"
};

const teamMembers = [
  // 8 Section Editors
  { fullName: "Irsad Tio Majid, S.Si.", email: "irsad.majid@risenologi.kpmunj.org", role: "editor", password: "CmLLbWah%m968P" },
  { fullName: "Ahmad Rizky Farhan, S.Hum.", email: "ahmad.farhan@risenologi.kpmunj.org", role: "editor", password: "5B#5vhZqVipSBD" },
  { fullName: "Chika Shafa Maura, S.Si.", email: "chika.maura@risenologi.kpmunj.org", role: "editor", password: "B%!%qkp39%4n%d" },
  { fullName: "Helga Gustian, S.Pd.", email: "helga.gustian@risenologi.kpmunj.org", role: "editor", password: "8Da*5Sj&L3VhR4" },
  { fullName: "Iif Ahmad Rifa'i, S.Pd.", email: "iif.rifai@risenologi.kpmunj.org", role: "editor", password: "^4z9s3A4&qTC!%" },
  { fullName: "Milayda Samsu, S.Si.", email: "milayda.samsu@risenologi.kpmunj.org", role: "editor", password: "Jy#W5zuQ76BkQ8" },
  { fullName: "Muhammad Abdurrahman Ihsan, S.Pd.", email: "abdurrahman.ihsan@risenologi.kpmunj.org", role: "editor", password: "Bcy&ypEg59s%!C" },
  { fullName: "Putri Rachman Fastya, S.Pd.", email: "putri.fastya@risenologi.kpmunj.org", role: "editor", password: "h!@iEEjw^s7i5L" },

  // 12 Journal Managers
  { fullName: "Aisyah Fitriani", email: "aisyah.fitriani@risenologi.kpmunj.org", role: "journal_manager", password: "&Q95q6EauQT&hd" },
  { fullName: "Amanda Nurifa", email: "amanda.nurifa@risenologi.kpmunj.org", role: "journal_manager", password: "TUG$j9DBL9eXLt" },
  { fullName: "Gabriela Amelia Desianta Munthe", email: "gabriela.munthe@risenologi.kpmunj.org", role: "journal_manager", password: "#^!ti3Xg9WZ7jt" },
  { fullName: "Michael Kurniawan Santosa", email: "michael.santosa@risenologi.kpmunj.org", role: "journal_manager", password: "7S7$&vEzHHacS@" },
  { fullName: "Bayu Saputra", email: "bayu.saputra@risenologi.kpmunj.org", role: "journal_manager", password: "Jp^hYjNw8A6#&N" },
  { fullName: "Aulia Nur Fadhillah", email: "aulia.fadhillah@risenologi.kpmunj.org", role: "journal_manager", password: "&6hPwyKAASKeMy" },
  { fullName: "Navisha Anggraini", email: "navisha.anggraini@risenologi.kpmunj.org", role: "journal_manager", password: "g7#vQSrVw#LLfW" },
  { fullName: "Alfian Miftahurrizki", email: "alfian.miftahurrizki@risenologi.kpmunj.org", role: "journal_manager", password: "7*%mz66uCAWYT%" },
  { fullName: "Ivan Juansyah", email: "ivan.juansyah@risenologi.kpmunj.org", role: "journal_manager", password: "W7PgH!jMHpYH#u" },
  { fullName: "Nur Aini", email: "nur.aini@risenologi.kpmunj.org", role: "journal_manager", password: "435^74DZrj!fJe" },
  { fullName: "Saybia Fayray Tabitha", email: "saybia.tabitha@risenologi.kpmunj.org", role: "journal_manager", password: "6^@H4KCYaDPL8D" },
  { fullName: "Raisa Ayaka Ramadhani", email: "raisa.ramadhani@risenologi.kpmunj.org", role: "journal_manager", password: "qUjy$XwK$8*96f" },
];

async function seedAll() {
  console.log("Seeding Admin & 20 Team Users...\n");
  const allUsers = [adminAccount, ...teamMembers];

  for (const u of allUsers) {
    const { data: searchData } = await supabase.auth.admin.listUsers();
    let existingUser = searchData?.users?.find(x => x.email === u.email);
    let userId = existingUser?.id;

    if (existingUser) {
      await supabase.auth.admin.updateUserById(existingUser.id, {
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.fullName }
      });
    } else {
      const { data: createData } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.fullName }
      });
      userId = createData?.user?.id;
    }

    if (userId) {
      await supabase.from("user_profiles").upsert({
        id: userId,
        full_name: u.fullName,
        role: u.role,
        updated_at: new Date().toISOString()
      });
      console.log(`✅ Processed User: ${u.fullName} <${u.email}> (${u.role})`);
    }
  }

  console.log("\n🎉 Total Active Accounts: 21 (1 Admin + 8 Section Editors + 12 Journal Managers)");
}

seedAll().catch(console.error);
