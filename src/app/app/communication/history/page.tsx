import { Metadata } from "next";
import { requireRole } from "@/features/auth/actions";
import { getCommunicationHistory } from "@/features/communication/actions";
import { HistoryList } from "./history-list";

export const metadata: Metadata = {
  title: "Riwayat Komunikasi Jurnal",
  description: "Catatan audit trail lengkap seluruh aktivitas korespondensi jurnal.",
};

export default async function CommunicationHistoryPage() {
  await requireRole(["administrator", "journal_manager", "editor"]);

  const history = await getCommunicationHistory();

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Riwayat Komunikasi</h1>
        <p className="text-muted-foreground mt-1">
          Daftar audit trail seluruh korespondensi email kepada penulis dan reviewer jurnal yang
          dikirimkan oleh tim editorial.
        </p>
      </div>

      <HistoryList initialHistory={history} />
    </div>
  );
}
