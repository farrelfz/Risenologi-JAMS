import { Metadata } from "next";
import { requireRole } from "@/features/auth/actions";
import { RubricClient } from "./rubric-client";

export const metadata: Metadata = {
  title: "Referensi Rubrik Akreditasi",
  description:
    "Kamus & panduan lengkap seluruh indikator akreditasi Arjuna (Management 49 + Substance 51 = 100 poin).",
};

export default async function RubricReferencePage() {
  await requireRole(["administrator", "journal_manager", "editor"]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kamus & Referensi Rubrik Akreditasi</h1>
        <p className="text-muted-foreground mt-1">
          Panduan lengkap penjelas kode-kode indikator akreditasi Arjuna (3A, 4B, 8B, dsb.) beserta
          bobot poin, kriteria kelulusan, dan sumber datanya di JAMS.
        </p>
      </div>

      <RubricClient />
    </div>
  );
}
