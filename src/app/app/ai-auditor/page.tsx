import { Metadata } from "next";
import { requireRole } from "@/features/auth/actions";
import { runFullJournalAudit } from "@/features/auditor/actions";
import { AuditorClient } from "./auditor-client";

export const metadata: Metadata = {
  title: "AI Auditor & Jejak Bukti",
  description: "Pusat deteksi, analisis, dan bukti verifikasi real-time untuk akreditasi jurnal.",
};

export default async function AIAuditorPage() {
  await requireRole(["administrator", "journal_manager", "editor"]);
  const initialAudit = await runFullJournalAudit();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          AI Auditor & Jejak Bukti (Evidence Hub)
        </h1>
        <p className="text-muted-foreground mt-1">
          Mesin pendeteksi, penganalisa, dan verifikator jejak bukti (evidence traceability)
          real-time untuk penilaian akreditasi jurnal.
        </p>
      </div>

      <AuditorClient initialAudit={initialAudit} />
    </div>
  );
}
