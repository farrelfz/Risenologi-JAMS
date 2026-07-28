"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function getRecentArticles() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const { data, error } = await supabase
    .from("articles")
    .select(
      `
      id,
      judul,
      abstrak,
      status,
      tanggal_submit,
      created_at,
      editions (
        volume,
        nomor,
        tahun
      ),
      article_authors (
        nama,
        urutan
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch articles:", error);
    return [];
  }

  // Sort by Edition Volume/Nomor DESC, then created_at DESC
  const sortedData = (data || []).sort((a: any, b: any) => {
    const edA = Array.isArray(a.editions) ? a.editions[0] : a.editions;
    const edB = Array.isArray(b.editions) ? b.editions[0] : b.editions;
    const volA = edA?.volume || 0;
    const volB = edB?.volume || 0;
    if (volA !== volB) return volB - volA;

    const noA = edA?.nomor || 0;
    const noB = edB?.nomor || 0;
    if (noA !== noB) return noB - noA;

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return sortedData;
}

export async function addManuscript(formData: FormData) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const judul = formData.get("judul") as string;
  const penulis = formData.get("penulis") as string;
  const abstrak = formData.get("abstrak") as string;
  const statusInput = (formData.get("status") as string) || "draft";
  const volumeStr = formData.get("volume") as string;
  const nomorStr = formData.get("nomor") as string;
  const tahunStr = formData.get("tahun") as string;

  if (!judul) {
    return { success: false, error: "Judul wajib diisi" };
  }

  // 1. Dapatkan atau buat jurnal default
  let { data: journals } = await supabase.from("journals").select("id").limit(1);
  let journalId = journals?.[0]?.id;

  // 2. Insert atau Upsert Edisi (Volume, Nomor, Tahun)
  let editionId = null;
  if (journalId) {
    const volume = volumeStr ? parseInt(volumeStr, 10) : 11;
    const nomor = nomorStr ? parseInt(nomorStr, 10) : 1;
    const tahun = tahunStr ? parseInt(tahunStr, 10) : new Date().getFullYear();

    const { data: ed } = await supabase
      .from("editions")
      .upsert(
        {
          journal_id: journalId,
          volume,
          nomor,
          tahun,
          status: statusInput === "terbit" ? "published" : "draft",
        },
        { onConflict: "journal_id,volume,nomor" },
      )
      .select("id")
      .single();
    if (ed) editionId = ed.id;
  }

  // 3. Insert Artikel
  const { data: article, error: artErr } = await supabase
    .from("articles")
    .insert({
      edition_id: editionId,
      judul,
      abstrak,
      status: statusInput === "terbit" ? "terbit" : "draft",
      metadata_lengkap: true,
    })
    .select("id")
    .single();

  if (artErr || !article) {
    console.error("Insert article error:", artErr);
    return { success: false, error: "Gagal menyimpan naskah" };
  }

  // 4. Insert Penulis
  if (penulis) {
    const authorNames = penulis
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    const authorsToInsert = authorNames.map((name, idx) => ({
      article_id: article.id,
      urutan: idx + 1,
      nama: name,
      negara: "ID",
    }));

    if (authorsToInsert.length > 0) {
      await supabase.from("article_authors").insert(authorsToInsert);
    }
  }

  revalidatePath("/app/manuscripts");
  revalidatePath("/app/dashboard");
  return { success: true };
}

export async function deleteManuscript(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const { error } = await supabase.from("articles").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete manuscript:", error);
    return { success: false, error: "Gagal menghapus naskah" };
  }

  revalidatePath("/app/manuscripts");
  revalidatePath("/app/dashboard");
  return { success: true };
}

export async function updateManuscript(id: string, formData: FormData) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const judul = formData.get("judul") as string;
  const penulis = formData.get("penulis") as string;
  const abstrak = formData.get("abstrak") as string;
  const statusInput = formData.get("status") as string;
  const volumeStr = formData.get("volume") as string;
  const nomorStr = formData.get("nomor") as string;
  const tahunStr = formData.get("tahun") as string;

  if (!judul) {
    return { success: false, error: "Judul wajib diisi" };
  }

  // 1. Dapatkan journal_id
  let { data: journals } = await supabase.from("journals").select("id").limit(1);
  let journalId = journals?.[0]?.id;

  // 2. Upsert Edisi jika volume & nomor diisi
  let editionId = null;
  if (journalId && volumeStr !== undefined && nomorStr !== undefined) {
    const volume = parseInt(volumeStr, 10) || 11;
    const nomor = parseInt(nomorStr, 10) || 1;
    const tahun = parseInt(tahunStr, 10) || new Date().getFullYear();

    const { data: ed } = await supabase
      .from("editions")
      .upsert(
        {
          journal_id: journalId,
          volume,
          nomor,
          tahun,
          status: statusInput === "terbit" ? "published" : "draft",
        },
        { onConflict: "journal_id,volume,nomor" },
      )
      .select("id")
      .single();

    if (ed) editionId = ed.id;
  }

  // 3. Update Artikel
  const updatePayload: any = { judul, abstrak };
  if (statusInput) {
    updatePayload.status = statusInput === "terbit" ? "terbit" : "draft";
  }
  if (editionId) {
    updatePayload.edition_id = editionId;
  }

  const { error: artErr } = await supabase.from("articles").update(updatePayload).eq("id", id);

  if (artErr) {
    console.error("Update article error:", artErr);
    return { success: false, error: "Gagal memperbarui naskah" };
  }

  // 4. Update Penulis (Delete & Insert)
  await supabase.from("article_authors").delete().eq("article_id", id);

  if (penulis) {
    const authorNames = penulis
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    const authorsToInsert = authorNames.map((name, idx) => ({
      article_id: id,
      urutan: idx + 1,
      nama: name,
      negara: "ID",
    }));

    if (authorsToInsert.length > 0) {
      await supabase.from("article_authors").insert(authorsToInsert);
    }
  }

  revalidatePath("/app/manuscripts");
  revalidatePath("/app/dashboard");
  return { success: true };
}

export interface ArticleEvaluationScores {
  [itemCode: string]: number;
}

export async function saveArticleSubstanceEvaluation(
  articleId: string,
  scores: ArticleEvaluationScores,
  catatan?: string,
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const entries = Object.entries(scores);
  for (const [code, score] of entries) {
    const { data: existing } = await supabase
      .from("score_estimates")
      .select("id")
      .eq("entitas_id", articleId)
      .eq("indikator_kode", code)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("score_estimates")
        .update({
          skor: score,
          sumber: "verifikasi_manusia",
          catatan: catatan || null,
          tanggal_hitung: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("score_estimates").insert({
        entitas_id: articleId,
        indikator_kode: code,
        indikator_nama: `Evaluasi Mutu Naskah ${code}`,
        skor: score,
        skor_maks: 5.0,
        sumber: "verifikasi_manusia",
        catatan: catatan || null,
        tanggal_hitung: new Date().toISOString(),
      });
    }
  }

  revalidatePath("/app/manuscripts");
  revalidatePath("/app/indicators");
  return { success: true, message: "Evaluasi mutu naskah berhasil disimpan." };
}

export async function getArticleSubstanceEvaluations(articleId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const { data } = await supabase
    .from("score_estimates")
    .select("indikator_kode, skor, catatan")
    .eq("entitas_id", articleId);

  const result: { [key: string]: number } = {};
  if (data) {
    data.forEach((row: any) => {
      result[row.indikator_kode] = Number(row.skor);
    });
  }
  return result;
}
