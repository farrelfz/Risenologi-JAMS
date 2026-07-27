import { Metadata } from "next";
import { requireRole } from "@/features/auth/actions";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createClient } from "@supabase/supabase-js";
import { EditorManager } from "./editor-manager";

export const metadata: Metadata = {
  title: "Registry Dewan Penyunting",
};

async function getEditors() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const { data } = await supabase
    .from("editorial_board_members")
    .select("*")
    .order("nama", { ascending: true });

  return data || [];
}

export default async function EditorRegistryPage() {
  const profile = await requireRole(["administrator", "journal_manager", "editor"]);

  const rawEditors = await getEditors();
  const editors = rawEditors.map((e) => ({
    id: e.id,
    nama: e.nama,
    jabatan: e.jabatan || "Editor",
    afiliasi: e.afiliasi || "",
    negara: e.negara || "ID",
    email: e.email || "",
    kualifikasiInternasional: e.kualifikasi_internasional,
    statusAktif: e.status_aktif,
  }));
  const canEdit = profile.role === "administrator" || profile.role === "journal_manager";

  // Dynamic calculations
  const totalEditors = editors.length;
  const internationalEditors = editors.filter((e) => e.kualifikasiInternasional).length;
  const internationalRatio =
    totalEditors > 0 ? ((internationalEditors / totalEditors) * 100).toFixed(1) : "0";
  const uniqueCountries = Array.from(new Set(editors.map((e) => e.negara)));
  const numCountries = uniqueCountries.length;

  const meetsRequirement = numCountries >= 4 && parseFloat(internationalRatio) > 50;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dewan Penyunting (Editorial Board)</h1>
        <p className="text-muted-foreground mt-1">
          Indikator 3B ARJUNA: Target ≥4 negara, &gt;50% internasional. (Skor Max: 5 Poin)
        </p>
      </div>

      {!meetsRequirement && (
        <Alert className="glass-card border-l-4 border-l-amber-500 text-amber-500 animate-in-fade bg-amber-500/10">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <AlertTitle className="font-semibold text-amber-500">Status Indikator 3B</AlertTitle>
          <AlertDescription className="text-amber-500 mt-1">
            Saat ini tercatat {totalEditors} editor dari {numCountries} negara dengan rasio
            internasional {internationalRatio}%. Untuk skor maksimal (5 Poin), tambahkan editor dari
            minimal 4 negara yang berbeda.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card
          className="glass-card border-border/50 animate-in-fade"
          style={{ animationDelay: "100ms" }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Editor Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br from-primary to-blue-400 drop-shadow-sm">
              {totalEditors}
            </div>
          </CardContent>
        </Card>
        <Card
          className="glass-card border-border/50 animate-in-fade"
          style={{ animationDelay: "150ms" }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Diversitas Negara
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-500 drop-shadow-sm">
              {numCountries} Negara
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {uniqueCountries.length > 0 ? uniqueCountries.join(", ") : "Belum ada data"}
            </p>
          </CardContent>
        </Card>
        <Card
          className="glass-card border-border/50 animate-in-fade"
          style={{ animationDelay: "200ms" }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rasio Internasional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-500 drop-shadow-sm">
              {internationalRatio}%
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Target: &gt; 50%</p>
          </CardContent>
        </Card>
      </div>

      <EditorManager initialEditors={editors} canEdit={canEdit} />
    </div>
  );
}
