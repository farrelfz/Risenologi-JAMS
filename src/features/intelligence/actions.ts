"use server";

import { askGroq } from "@/lib/ai/groq";
import { createClient } from "@/lib/supabase/server";

export async function generateGroqAiActionPlan() {
  try {
    const supabase = await createClient();

    const [
      { data: journal },
      { data: reviewers },
      { data: edBoard },
      { data: articles },
      { data: scores },
    ] = await Promise.all([
      supabase.from("journals").select("*").limit(1).single(),
      supabase.from("reviewers").select("*"),
      supabase.from("editorial_board_members").select("*"),
      supabase.from("articles").select("*"),
      supabase.from("score_estimates").select("*"),
    ]);

    const totalCalculated = scores
      ? Number(scores.reduce((acc: number, s: any) => acc + Number(s.skor || 0), 0).toFixed(1))
      : 68.5;

    const systemPrompt = `Anda adalah konsultan senior akreditasi jurnal ilmiah ARJUNA (Kemenristekdikti/BRIN). 
Tugas Anda adalah menganalisis data empiris jurnal ilmiah dan memberikan Action Plan taktis (Roadmap Kenaikan Peringkat Sinta) secara spesifik, lugas, dan berbobot.`;

    const userPrompt = `Analisis data jurnal berikut:
- Nama Jurnal: ${journal?.nama || "Risenologi"}
- Target Sinta: ${journal?.target_sinta || "sinta_2"}
- Skor Terverifikasi Saat Ini: ${totalCalculated} Poin
- Jumlah Reviewer Aktif: ${(reviewers || []).length} orang
- Jumlah Dewan Redaksi: ${(edBoard || []).length} orang
- Jumlah Artikel Terdata: ${(articles || []).length} artikel

Berikan Action Plan 3 Langkah Prioritas Utama untuk menaikkan skor akreditasi jurnal ini ke target maksimal. 
Format jawaban dalam Bahasa Indonesia yang profesional, padat, dan disertai estimasi tambahan poin untuk tiap langkahnya.`;

    const responseText = await askGroq(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      0.3,
    );

    return {
      success: true,
      actionPlan: responseText,
      totalScore: totalCalculated,
    };
  } catch (error: any) {
    console.error("Failed to generate Groq AI Action Plan:", error);
    return {
      success: false,
      error: error.message || "Gagal menghubungi layanan Groq AI Engine.",
    };
  }
}
