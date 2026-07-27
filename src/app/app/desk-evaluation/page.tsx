import { Metadata } from "next";
import { requireRole } from "@/features/auth/actions";
import { getFirstJournal } from "@/features/journal/actions";
import { getDeskEvaluation } from "@/features/desk-evaluation/actions";
import { DeskEvaluationForm } from "./desk-evaluation-form";

export const metadata: Metadata = {
  title: "Desk Evaluation",
};

export default async function DeskEvaluationPage() {
  await requireRole(["administrator", "journal_manager"]);

  const journal = await getFirstJournal();
  const evaluation = journal ? await getDeskEvaluation(journal.id) : null;

  return (
    <div className="space-y-6 max-w-5xl">
      {journal ? (
        <DeskEvaluationForm journalId={journal.id} initialData={evaluation} />
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Silakan isi pengaturan jurnal terlebih dahulu.</p>
        </div>
      )}
    </div>
  );
}
