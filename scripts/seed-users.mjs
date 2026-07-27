import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY; // Must use service role key to bypass RLS and create users

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

const defaultUsers = [
  {
    email: "admin@risenologi.id",
    password: "Password123!",
    fullName: "Super Administrator",
    role: "administrator",
  },
  {
    email: "manager@risenologi.id",
    password: "Password123!",
    fullName: "Journal Manager",
    role: "journal_manager",
  },
  {
    email: "editor@risenologi.id",
    password: "Password123!",
    fullName: "Section Editor",
    role: "editor",
  },
];

async function seed() {
  console.log("Seeding default users...");

  for (const u of defaultUsers) {
    // 1. Create auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
    });

    if (authError) {
      if (
        authError.message.includes("already been registered") ||
        authError.message.includes("already registered")
      ) {
        console.log(`User ${u.email} already exists. Skipping auth creation.`);
      } else {
        console.error(`Error creating user ${u.email}:`, authError.message);
        continue;
      }
    }

    // Attempt to get user ID if already existed
    let userId = authData?.user?.id;
    if (!userId) {
      const { data: searchData } = await supabase.auth.admin.listUsers();
      userId = searchData.users.find((user) => user.email === u.email)?.id;
    }

    if (!userId) {
      console.error(`Could not determine user ID for ${u.email}`);
      continue;
    }

    // 2. Upsert user_profiles
    const { error: profileError } = await supabase.from("user_profiles").upsert({
      id: userId,
      full_name: u.fullName,
      role: u.role,
    });

    if (profileError) {
      console.error(`Error creating profile for ${u.email}:`, profileError.message);
    } else {
      console.log(`Successfully seeded: ${u.email} (${u.role})`);
    }
  }

  console.log("Done!");
}

seed().catch(console.error);
