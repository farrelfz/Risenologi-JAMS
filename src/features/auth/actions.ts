"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signInSchema } from "@/features/accreditation/schema";

export async function signIn(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: "Email atau password salah." };
  }

  revalidatePath("/");
  redirect("/app/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).single();

  if (!data) return null;

  return {
    id: data.id as string,
    fullName: data.full_name as string,
    role: data.role as "administrator" | "journal_manager" | "editor",
    avatarUrl: data.avatar_url as string | undefined,
  };
}

export async function requireRole(
  allowedRoles: Array<"administrator" | "journal_manager" | "editor">,
) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/sign-in");
  }

  if (!allowedRoles.includes(profile.role)) {
    throw new Error(`Akses ditolak. Role ${profile.role} tidak memiliki izin untuk operasi ini.`);
  }

  return profile;
}
