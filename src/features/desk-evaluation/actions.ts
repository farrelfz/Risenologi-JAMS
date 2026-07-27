"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { requireRole, getCurrentUserProfile } from "@/features/auth/actions";

export async function saveDeskEvaluation(formData: FormData) {
  // Hanya administrator dan manajer jurnal yang dapat mengubah
  const profile = await requireRole(["administrator", "journal_manager"]);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const journal_id = formData.get("journal_id") as string;
  if (!journal_id) {
    return { success: false, error: "ID jurnal tidak ditemukan." };
  }

  // Parse checkbox data
  const item_1_nama_issn = formData.get("item_1_nama_issn") === "on";
  const item_2_url_benar = formData.get("item_2_url_benar") === "on";
  const item_3_status_sinta = formData.get("item_3_status_sinta") === "on";
  const item_4_masa_berlaku = formData.get("item_4_masa_berlaku") === "on";
  const item_5_etika_cope = formData.get("item_5_etika_cope") === "on";
  const item_6_akun_demo = formData.get("item_6_akun_demo") === "on";
  const item_7_frekuensi_terbit = formData.get("item_7_frekuensi_terbit") === "on";
  const item_8_min_artikel_pdf = formData.get("item_8_min_artikel_pdf") === "on";

  // Check if evaluation exists
  const { data: existing } = await supabase
    .from("desk_evaluation_checks")
    .select("id")
    .eq("journal_id", journal_id)
    .single();

  const payload = {
    journal_id,
    item_1_nama_issn,
    item_2_url_benar,
    item_3_status_sinta,
    item_4_masa_berlaku,
    item_5_etika_cope,
    item_6_akun_demo,
    item_7_frekuensi_terbit,
    item_8_min_artikel_pdf,
    dibuat_oleh: profile.id,
    tanggal_cek: new Date().toISOString(),
  };

  let error;

  if (existing) {
    // Update existing
    const { error: updateError } = await supabase
      .from("desk_evaluation_checks")
      .update(payload)
      .eq("id", existing.id);
    error = updateError;
  } else {
    // Insert new
    const { error: insertError } = await supabase.from("desk_evaluation_checks").insert(payload);
    error = insertError;
  }

  if (error) {
    console.error("Failed to save desk evaluation:", error);
    return { success: false, error: "Gagal menyimpan hasil evaluasi." };
  }

  revalidatePath("/app/desk-evaluation");
  revalidatePath("/app/dashboard");

  return { success: true };
}

export async function getDeskEvaluation(journalId: string) {
  if (!journalId) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const { data, error } = await supabase
    .from("desk_evaluation_checks")
    .select("*")
    .eq("journal_id", journalId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "Row not found"
    console.error("Failed to get desk evaluation:", error);
    return null;
  }

  return data;
}
