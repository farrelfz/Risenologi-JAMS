import { Metadata } from "next";
import { requireRole } from "@/features/auth/actions";
import { AlertCircle, Users, Globe, TrendingUp, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createClient } from "@supabase/supabase-js";
import { ReviewerManager } from "./reviewer-manager";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Registry Reviewer",
};

async function getReviewers() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const { data } = await supabase.from("reviewers").select("*").order("nama", { ascending: true });

  return data || [];
}

export default async function ReviewerRegistryPage() {
  const profile = await requireRole(["administrator", "journal_manager", "editor"]);

  const rawReviewers = await getReviewers();
  const reviewers = rawReviewers.map((r) => ({
    id: r.id,
    nama: r.nama,
    afiliasi: r.afiliasi || "",
    negara: r.negara || "ID",
    email: r.email || "",
    kualifikasiInternasional: r.kualifikasi_internasional,
    statusAktif: r.status_aktif,
  }));
  const canEdit = profile.role === "administrator" || profile.role === "journal_manager";

  // Dynamic calculations
  const totalReviewers = reviewers.length;
  const internationalReviewers = reviewers.filter((r) => r.kualifikasiInternasional).length;
  const internationalRatio =
    totalReviewers > 0 ? ((internationalReviewers / totalReviewers) * 100).toFixed(1) : "0";
  const uniqueCountries = Array.from(new Set(reviewers.map((r) => r.negara)));
  const numCountries = uniqueCountries.length;

  // Akreditasi Target Logic (Sinta 1/2 = 4 negara, >50%)
  const meetsInternationalRatio = parseFloat(internationalRatio) > 50;
  const meetsCountryCount = numCountries >= 4;
  const warningText =
    !meetsCountryCount && !meetsInternationalRatio
      ? `Sangat Kritis! Saat ini ${internationalRatio}% internasional dan hanya dari ${numCountries} negara.`
      : `Skor belum maksimal. Tambah reviewer internasional.`;

  const skor3A = numCountries >= 4 && meetsInternationalRatio ? 6.0 : numCountries >= 2 ? 4.0 : 2.0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mitra Bestari (Reviewer)</h1>
        <p className="text-muted-foreground mt-1">
          Indikator 3A ARJUNA: Target ≥4 negara, &gt;50% internasional. (Skor Max: 6 Poin)
        </p>
      </div>

      <Alert className="glass-card border-l-4 border-l-destructive text-destructive animate-in-fade bg-destructive/10">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <AlertTitle className="font-semibold text-destructive">
          Status Indikator 3A (Sinta 2 & 1)
        </AlertTitle>
        <AlertDescription className="text-destructive mt-1">
          {warningText} Semua reviewer berasal dari Indonesia ({numCountries} negara). Tambahkan
          reviewer dari luar negeri (seperti MY, US, JP, AU) untuk mendapatkan skor maksimal 6 Poin.
        </AlertDescription>
      </Alert>

      {/* Compact High-Density Summary Bar (4 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card border border-border/50 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">
              Total Reviewer Aktif
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-foreground">{totalReviewers}</span>
              <span className="text-[11px] text-muted-foreground font-normal">orang</span>
            </div>
          </div>
        </div>

        <div className="glass-card border border-border/50 rounded-xl p-3.5 flex items-center gap-3">
          <div
            className={cn(
              "p-2.5 rounded-xl shrink-0",
              numCountries >= 4
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-destructive/10 text-destructive",
            )}
          >
            <Globe className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Diversitas Negara</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span
                className={cn(
                  "text-2xl font-black",
                  numCountries >= 4 ? "text-emerald-500" : "text-destructive",
                )}
              >
                {numCountries}
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">
                negara ({uniqueCountries.join(", ")})
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card border border-border/50 rounded-xl p-3.5 flex items-center gap-3">
          <div
            className={cn(
              "p-2.5 rounded-xl shrink-0",
              meetsInternationalRatio
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-destructive/10 text-destructive",
            )}
          >
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">
              Rasio Internasional
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span
                className={cn(
                  "text-2xl font-black",
                  meetsInternationalRatio ? "text-emerald-500" : "text-destructive",
                )}
              >
                {internationalRatio}%
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">target &gt;50%</span>
            </div>
          </div>
        </div>

        <div className="glass-card border border-border/50 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Estimasi Skor 3A</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-blue-500">{skor3A.toFixed(1)}</span>
              <span className="text-[11px] text-muted-foreground font-normal">/ 6.0 poin</span>
            </div>
          </div>
        </div>
      </div>

      <ReviewerManager initialReviewers={reviewers} canEdit={canEdit} />
    </div>
  );
}
