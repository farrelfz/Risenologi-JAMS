"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { requireRole } from "@/features/auth/actions";

function getAdminSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
}

export async function addEditor(formData: FormData) {
  await requireRole(["administrator", "journal_manager"]);

  const supabase = getAdminSupabase();
  const nama = formData.get("nama") as string;
  const jabatan = (formData.get("jabatan") as string) || "Editor";
  const afiliasi = formData.get("afiliasi") as string;
  const negara = (formData.get("negara") as string) || "ID";
  const email = (formData.get("email") as string) || "";
  const kualifikasi_internasional =
    formData.get("kualifikasi_internasional") === "on" || negara !== "ID";
  const status_aktif = formData.get("status_aktif") === "on";

  if (!nama) {
    return { success: false, error: "Nama editor wajib diisi." };
  }

  // Get journal ID
  const { data: journal } = await supabase.from("journals").select("id").limit(1).single();
  if (!journal) {
    return { success: false, error: "Jurnal tidak ditemukan." };
  }

  const { error } = await supabase.from("editorial_board_members").insert({
    journal_id: journal.id,
    nama,
    jabatan,
    afiliasi,
    negara,
    email,
    kualifikasi_internasional,
    status_aktif,
  });

  if (error) {
    console.error("Failed to add editor:", error);
    return { success: false, error: "Gagal menambah anggota dewan penyunting." };
  }

  revalidatePath("/app/registry/editors");
  revalidatePath("/app/indicators");
  revalidatePath("/app/dashboard");

  return { success: true };
}

export async function updateEditor(formData: FormData) {
  await requireRole(["administrator", "journal_manager"]);

  const supabase = getAdminSupabase();
  const id = formData.get("id") as string;
  const nama = formData.get("nama") as string;
  const jabatan = (formData.get("jabatan") as string) || "Editor";
  const afiliasi = formData.get("afiliasi") as string;
  const negara = (formData.get("negara") as string) || "ID";
  const email = (formData.get("email") as string) || "";
  const kualifikasi_internasional =
    formData.get("kualifikasi_internasional") === "on" || negara !== "ID";
  const status_aktif = formData.get("status_aktif") === "on";

  if (!id || !nama) {
    return { success: false, error: "Data tidak lengkap." };
  }

  const { error } = await supabase
    .from("editorial_board_members")
    .update({
      nama,
      jabatan,
      afiliasi,
      negara,
      email,
      kualifikasi_internasional,
      status_aktif,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to update editor:", error);
    return { success: false, error: "Gagal memperbarui editor." };
  }

  revalidatePath("/app/registry/editors");
  revalidatePath("/app/indicators");
  revalidatePath("/app/dashboard");

  return { success: true };
}

export async function deleteEditor(id: string) {
  await requireRole(["administrator", "journal_manager"]);

  const supabase = getAdminSupabase();
  const { error } = await supabase.from("editorial_board_members").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete editor:", error);
    return { success: false, error: "Gagal menghapus editor." };
  }

  revalidatePath("/app/registry/editors");
  revalidatePath("/app/indicators");
  revalidatePath("/app/dashboard");

  return { success: true };
}
