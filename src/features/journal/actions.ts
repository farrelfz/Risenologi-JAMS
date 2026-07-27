"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { requireRole } from "@/features/auth/actions";

export async function updateJournalSettings(formData: FormData) {
  // Hanya administrator dan manajer jurnal yang dapat mengubah pengaturan
  await requireRole(["administrator", "journal_manager"]);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const id = formData.get("id") as string;
  const nama = formData.get("nama") as string;
  const p_issn = formData.get("p_issn") as string;
  const e_issn = formData.get("e_issn") as string;
  const url_situs = formData.get("url_situs") as string;
  const penerbit = formData.get("penerbit") as string;
  const target_sinta = formData.get("target_sinta") as string;

  // New ARJUNA fields
  const tahun_terbit = formData.get("tahun_terbit") as string;
  const tanggal_terakhir_diajukan = formData.get("tanggal_terakhir_diajukan") as string;
  const alamat_surat = formData.get("alamat_surat") as string;
  const frekuensi_terbitan = formData.get("frekuensi_terbitan") as string;
  const status_progres = formData.get("status_progres") as string;
  const total_nilai_akreditasi = formData.get("total_nilai_akreditasi")
    ? parseFloat(formData.get("total_nilai_akreditasi") as string)
    : null;
  const status_akreditasi = formData.get("status_akreditasi") as string;

  if (!id) {
    return { success: false, error: "ID jurnal tidak ditemukan." };
  }

  const { error } = await supabase
    .from("journals")
    .update({
      nama,
      p_issn,
      e_issn,
      url_situs,
      penerbit,
      target_sinta,
      tahun_terbit,
      tanggal_terakhir_diajukan,
      alamat_surat,
      frekuensi_terbitan,
      status_progres,
      total_nilai_akreditasi,
      status_akreditasi,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to update journal settings:", error);
    return { success: false, error: "Gagal menyimpan pengaturan jurnal." };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/dashboard");

  return { success: true };
}

export async function getFirstJournal() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const { data, error } = await supabase.from("journals").select("*").limit(1).single();

  if (error) {
    console.error("Failed to get journal:", error);
    return null;
  }

  return data;
}
