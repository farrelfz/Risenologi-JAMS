import { Metadata } from "next";
import { requireRole } from "@/features/auth/actions";
import { getMessageTemplates } from "@/features/communication/actions";
import { TemplateManager } from "./template-manager";

export const metadata: Metadata = {
  title: "Kelola Template Komunikasi",
  description: "Atur master template untuk korespondensi penulis dan reviewer.",
};

export default async function CommunicationTemplatesPage() {
  await requireRole(["administrator", "journal_manager"]);

  const templates = await getMessageTemplates();

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Master Template Komunikasi</h1>
        <p className="text-muted-foreground mt-1">
          Kelola master template pesan untuk surat konfirmasi naskah, keputusan editorial, undangan
          reviewer, dan pengingat deadline.
        </p>
      </div>

      <TemplateManager initialTemplates={templates} />
    </div>
  );
}
