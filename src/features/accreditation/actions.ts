"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/features/auth/actions";

export interface SaveScorePayload {
  journalId: string;
  indikatorKode: string;
  indikatorNama: string;
  skor: number;
  skorMaks: number;
  catatan?: string;
  category: "Substansi" | "Manajemen" | "Administratif";
}

export async function saveIndicatorEvaluationScore(payload: SaveScorePayload) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return { success: false, error: "Anda harus login untuk menyimpan penilaian." };
  }

  // RBAC checks:
  // - Editor: Only allowed for category "Substansi"
  // - Journal Manager: Allowed for "Manajemen" and "Substansi"
  // - Administrator: Allowed for everything
  if (profile.role === "editor" && payload.category !== "Substansi") {
    return {
      success: false,
      error: "Role Editor hanya berhak menyimpan penilaian pada bagian Substansi Artikel.",
    };
  }

  const supabase = await createClient();

  // Check if a score entry already exists for this journal & indicator_kode
  const { data: existing } = await supabase
    .from("score_estimates")
    .select("id")
    .eq("entitas_id", payload.journalId)
    .eq("indikator_kode", payload.indikatorKode)
    .maybeSingle();

  let error;
  if (existing) {
    const { error: updateErr } = await supabase
      .from("score_estimates")
      .update({
        skor: payload.skor,
        skor_maks: payload.skorMaks,
        indikator_nama: payload.indikatorNama,
        sumber: "verifikasi_manusia",
        catatan: payload.catatan || null,
        tanggal_hitung: new Date().toISOString(),
      })
      .eq("id", existing.id);
    error = updateErr;
  } else {
    const { error: insertErr } = await supabase.from("score_estimates").insert({
      entitas_id: payload.journalId,
      entitas_tipe: "jurnal",
      indikator_kode: payload.indikatorKode,
      indikator_nama: payload.indikatorNama,
      skor: payload.skor,
      skor_maks: payload.skorMaks,
      sumber: "verifikasi_manusia",
      versi_rubrik: "Instrumen Periode II 2025",
      catatan: payload.catatan || null,
      tanggal_hitung: new Date().toISOString(),
    });
    error = insertErr;
  }

  if (error) {
    console.error("Gagal menyimpan skor evaluasi:", error);
    return { success: false, error: `Gagal menyimpan ke database: ${error.message}` };
  }

  revalidatePath("/app/indicators");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/intelligence");

  return { success: true, message: `Skor ${payload.indikatorKode} berhasil disimpan.` };
}
