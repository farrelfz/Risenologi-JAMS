import { Metadata } from "next";
import { requireRole } from "@/features/auth/actions";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Globe,
  Users,
  TrendingUp,
  Info,
  AlertCircle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Internasionalisasi",
  description:
    "Pantau diversitas negara penulis, reviewer, dan editorial board untuk meningkatkan skor Aspirasi Wawasan (8 poin).",
};

async function getData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );
  const [
    { data: reviewers },
    { data: editorialBoard },
    { data: articleAuthors },
    { data: articles },
  ] = await Promise.all([
    supabase.from("reviewers").select("nama, negara, kualifikasi_internasional, afiliasi"),
    supabase.from("editorial_board_members").select("nama, negara, jabatan, afiliasi"),
    supabase.from("article_authors").select("nama, afiliasi, negara"),
    supabase.from("articles").select("id, judul, status"),
  ]);
  return {
    reviewers: reviewers || [],
    editorialBoard: editorialBoard || [],
    articleAuthors: articleAuthors || [],
    articles: articles || [],
  };
}

function countByCountry(items: any[], countryField = "negara") {
  const counts: Record<string, number> = {};
  items.forEach((item) => {
    const c = item[countryField] || "Tidak Diketahui";
    counts[c] = (counts[c] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([country, count]) => ({ country, count }));
}

function computeScore(
  countries: string[],
  totalItems: number,
  intlCount: number,
): { score: number; max: number; description: string } {
  // Aspirasi Wawasan (4B) — max 8 poin, based on negara penulis
  // Mitra Bestari (3A) — max 6 poin, based on reviewer
  // Dewan Penyunting (3B) — max 5 poin, based on editorial board
  const uniqueCountries = new Set(
    countries.filter((c) => c && c !== "Indonesia" && c !== "Tidak Diketahui"),
  ).size;
  const ratio = totalItems > 0 ? intlCount / totalItems : 0;
  return {
    score: uniqueCountries,
    max: uniqueCountries >= 5 ? 5 : uniqueCountries,
    description: "",
  };
}

function ScoreGauge({ score, max, label }: { score: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, (score / max) * 100) : 0;
  const color =
    pct >= 80
      ? "from-emerald-600 to-emerald-400"
      : pct >= 50
        ? "from-amber-600 to-amber-400"
        : "from-red-600 to-red-400";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold text-foreground">
          {score}/{max}
        </span>
      </div>
      <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
        <div
          className={cn("h-full bg-gradient-to-r rounded-full transition-all duration-700", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CountryBar({
  country,
  count,
  total,
  flag,
}: {
  country: string;
  count: number;
  total: number;
  flag?: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 group">
      <div className="w-28 text-xs text-muted-foreground truncate group-hover:text-foreground transition-colors">
        {country}
      </div>
      <div className="flex-1 h-2 bg-muted/40 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-foreground w-8 text-right">{count}</span>
    </div>
  );
}

export default async function InternationalizationPage() {
  await requireRole(["administrator", "journal_manager", "editor"]);
  const { reviewers, editorialBoard, articleAuthors, articles } = await getData();

  // Reviewer stats
  const reviewerByCountry = countByCountry(reviewers);
  const intlReviewers = reviewers.filter(
    (r) => r.kualifikasi_internasional || (r.negara && r.negara !== "Indonesia"),
  ).length;
  const reviewerCountries = reviewerByCountry
    .map((c) => c.country)
    .filter((c) => c !== "Indonesia");
  const intlReviewerRatio = reviewers.length > 0 ? intlReviewers / reviewers.length : 0;

  // Editorial board stats
  const edBoardByCountry = countByCountry(editorialBoard);
  const intlEdBoard = editorialBoard.filter(
    (e: any) => e.negara && e.negara !== "Indonesia",
  ).length;
  const edBoardCountries = edBoardByCountry.map((c) => c.country).filter((c) => c !== "Indonesia");
  const intlEdBoardRatio = editorialBoard.length > 0 ? intlEdBoard / editorialBoard.length : 0;

  // Author stats
  const authorByCountry = countByCountry(articleAuthors);
  const intlAuthors = articleAuthors.filter(
    (a: any) => a.negara && a.negara !== "Indonesia",
  ).length;
  const authorCountries = Array.from(
    new Set(articleAuthors.map((a: any) => a.negara).filter((c: string) => c && c !== "Indonesia")),
  );
  const intlAuthorRatio = articleAuthors.length > 0 ? intlAuthors / articleAuthors.length : 0;

  // Skor Aspirasi Wawasan (max 8) — dari keberagaman negara penulis
  const aspirationScore =
    authorCountries.length >= 5
      ? 8
      : authorCountries.length >= 4
        ? 6
        : authorCountries.length >= 3
          ? 4
          : authorCountries.length >= 2
            ? 2
            : 0;

  // Skor Mitra Bestari (max 6)
  const mitraBestariScore =
    reviewerCountries.length >= 4 && intlReviewerRatio > 0.5
      ? 6
      : reviewerCountries.length >= 2
        ? 4
        : 2;

  // Skor Dewan Penyunting (max 5)
  const dewanScore =
    edBoardCountries.length >= 4 && intlEdBoardRatio > 0.5
      ? 5
      : edBoardCountries.length >= 2
        ? 3
        : 1;

  const totalInternationalization = aspirationScore + mitraBestariScore + dewanScore;
  const maxInternationalization = 8 + 6 + 5; // = 19

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Internasionalisasi</h1>
        <p className="text-muted-foreground mt-1">
          Diversitas negara penulis, reviewer, dan dewan penyunting. Mendorong 19 poin gabungan
          (Aspirasi Wawasan + Mitra Bestari + Dewan Penyunting).
        </p>
      </div>

      {/* Summary Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-border/50 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Skor Internasionalisasi</CardTitle>
            <CardDescription className="text-xs">
              Total 3 indikator yang dipengaruhi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <span className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-primary to-blue-400">
                {totalInternationalization}
              </span>
              <span className="text-muted-foreground text-xl">/{maxInternationalization}</span>
            </div>
            <div className="space-y-3 mt-2">
              <ScoreGauge score={aspirationScore} max={8} label="Aspirasi Wawasan (4B)" />
              <ScoreGauge score={mitraBestariScore} max={6} label="Mitra Bestari (3A)" />
              <ScoreGauge score={dewanScore} max={5} label="Dewan Penyunting (3B)" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Insight Kunci</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Reviewers */}
            <div className="rounded-lg border border-border/40 bg-muted/10 p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Reviewer</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {reviewers.length} total · {reviewerByCountry.length} negara
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Internasional</span>
                  <p
                    className={cn(
                      "font-bold text-lg",
                      intlReviewerRatio > 0.5 ? "text-emerald-500" : "text-amber-500",
                    )}
                  >
                    {(intlReviewerRatio * 100).toFixed(0)}%
                  </p>
                  <p className="text-muted-foreground">Target: &gt;50%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Jumlah Negara</span>
                  <p
                    className={cn(
                      "font-bold text-lg",
                      reviewerByCountry.length >= 4 ? "text-emerald-500" : "text-amber-500",
                    )}
                  >
                    {reviewerByCountry.length}
                  </p>
                  <p className="text-muted-foreground">Target: ≥4 negara</p>
                </div>
              </div>
            </div>

            {/* Editorial Board */}
            <div className="rounded-lg border border-border/40 bg-muted/10 p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-semibold">Dewan Penyunting</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {editorialBoard.length} anggota · {edBoardByCountry.length} negara
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Internasional</span>
                  <p
                    className={cn(
                      "font-bold text-lg",
                      intlEdBoardRatio > 0.5 ? "text-emerald-500" : "text-amber-500",
                    )}
                  >
                    {(intlEdBoardRatio * 100).toFixed(0)}%
                  </p>
                  <p className="text-muted-foreground">Target: &gt;50%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Jumlah Negara</span>
                  <p
                    className={cn(
                      "font-bold text-lg",
                      edBoardByCountry.length >= 4 ? "text-emerald-500" : "text-amber-500",
                    )}
                  >
                    {edBoardByCountry.length}
                  </p>
                  <p className="text-muted-foreground">Target: ≥4 negara</p>
                </div>
              </div>
            </div>

            {/* Authors */}
            <div className="rounded-lg border border-border/40 bg-muted/10 p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-semibold">Penulis (Aspirasi Wawasan)</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {articleAuthors.length} penulis · {authorByCountry.length} negara
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Internasional</span>
                  <p
                    className={cn(
                      "font-bold text-lg",
                      intlAuthorRatio > 0.3 ? "text-emerald-500" : "text-amber-500",
                    )}
                  >
                    {articleAuthors.length > 0 ? (intlAuthorRatio * 100).toFixed(0) : "—"}%
                  </p>
                  <p className="text-muted-foreground">Target: &gt;5 negara</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Jumlah Negara</span>
                  <p
                    className={cn(
                      "font-bold text-lg",
                      authorByCountry.length >= 5 ? "text-emerald-500" : "text-amber-500",
                    )}
                  >
                    {authorByCountry.length}
                  </p>
                  <p className="text-muted-foreground">Target: ≥5 negara</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Country distributions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Sebaran Reviewer", data: reviewerByCountry, total: reviewers.length },
          {
            title: "Sebaran Dewan Penyunting",
            data: edBoardByCountry,
            total: editorialBoard.length,
          },
          { title: "Sebaran Negara Penulis", data: authorByCountry, total: articleAuthors.length },
        ].map((group) => (
          <Card key={group.title} className="glass-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{group.title}</CardTitle>
              <CardDescription className="text-xs">{group.total} total</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {group.data.length > 0 ? (
                group.data
                  .slice(0, 8)
                  .map(({ country, count }) => (
                    <CountryBar key={country} country={country} count={count} total={group.total} />
                  ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Belum ada data negara
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert className="border-border/40 bg-muted/10">
        <Info className="h-4 w-4 text-muted-foreground" />
        <AlertTitle className="text-sm font-medium text-muted-foreground">
          Cara Meningkatkan Skor
        </AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground mt-1">
          Aspirasi Wawasan (8 poin) adalah pengungkit terbesar — dan paling sulit ditingkatkan
          karena bergantung pada Call for Paper internasional. Mulai dari Mitra Bestari (6 poin)
          yang lebih mudah: cukup merekrut reviewer dari 4+ negara dan memastikan &gt;50% berlabel
          internasional.
        </AlertDescription>
      </Alert>
    </div>
  );
}
