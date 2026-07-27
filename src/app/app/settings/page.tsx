import { Metadata } from "next";
import { requireRole } from "@/features/auth/actions";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getFirstJournal } from "@/features/journal/actions";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = {
  title: "Pengaturan Jurnal",
};

export default async function SettingsPage() {
  // Hanya administrator dan manajer jurnal yang dapat mengakses halaman ini
  await requireRole(["administrator", "journal_manager"]);

  const journal = await getFirstJournal();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Identitas Jurnal</h1>
        <p className="text-muted-foreground mt-2">
          Kelola informasi dan status akreditasi nasional sesuai standar ARJUNA.
        </p>
      </div>

      <Alert className="glass-card border-l-4 border-l-primary text-primary animate-in-fade bg-primary/10">
        <AlertCircle className="h-5 w-5 text-primary" />
        <AlertTitle className="font-semibold text-primary">Status Verifikasi</AlertTitle>
        <AlertDescription className="text-primary mt-1">
          Mohon pastikan data afiliasi kelembagaan diisi dengan benar untuk memaksimalkan poin pada
          indikator Manajemen Kelembagaan.
        </AlertDescription>
      </Alert>

      <SettingsForm initialData={journal} />
    </div>
  );
}
