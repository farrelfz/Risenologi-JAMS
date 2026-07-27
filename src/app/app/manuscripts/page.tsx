import { Metadata } from "next";
import { requireRole } from "@/features/auth/actions";
import { AddManuscriptForm } from "./add-manuscript-form";
import { getRecentArticles } from "@/features/articles/actions";
import { ManuscriptList } from "./manuscript-list";

export const metadata: Metadata = {
  title: "Kesiapan Naskah (Akreditasi)",
};

export default async function ManuscriptsPage() {
  await requireRole(["administrator", "journal_manager", "editor"]);

  const rawArticles = await getRecentArticles();

  // Format the articles for UI display
  const articles = rawArticles.map((m: any) => {
    // authors is an array from supabase relation, sort by urutan and join
    const authorArray = Array.isArray(m.article_authors) ? m.article_authors : [];
    authorArray.sort((a: any, b: any) => a.urutan - b.urutan);
    const authorStr = authorArray.map((a: any) => a.nama).join(", ");

    // Check if it has editions
    const ed = Array.isArray(m.editions) ? m.editions[0] : m.editions;
    const editionStr = ed ? `Vol ${ed.volume} No ${ed.nomor} (${ed.tahun})` : "Belum Ditugaskan";

    return {
      id: m.id,
      judul: m.judul,
      penulis: authorStr || "Anonim",
      status: m.status === "terbit" ? "Terbit" : m.status,
      skor: null,
      editionStr,
      volume: ed?.volume || 11,
      nomor: ed?.nomor || 1,
      tahun: ed?.tahun || 2026,
      abstrak: m.abstrak || "",
      kataKunci: m.kata_kunci || [],
      chkJudul: Boolean(m.judul && m.abstrak && m.abstrak.length > 50),
      chkNovelty: Boolean(m.abstrak && m.abstrak.length > 200),
      chkRef: Boolean(m.doi),
      chkAnalisis: Boolean(
        m.status === "terbit" ||
        (m.abstrak &&
          (m.abstrak.toLowerCase().includes("hasil") ||
            m.abstrak.toLowerCase().includes("result"))),
      ),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kesiapan Naskah</h1>
          <p className="text-muted-foreground mt-1">
            Daftar seluruh artikel dan manuskrip yang tercatat dalam sistem.
          </p>
        </div>
        <AddManuscriptForm />
      </div>

      <ManuscriptList initialArticles={articles} />
    </div>
  );
}
