// ✅ GOOD: Action validates, enforces RBAC, delegates to service
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { createJournalSchema } from "../schema";
import { JournalRepository } from "../repository";
import { JournalService } from "../service";

export async function createJournal(formData: FormData) {
  // 1. RBAC
  await requireRole(["administrator", "journal_manager"]);

  // 2. Validate
  const parsed = createJournalSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  // 3. Execute
  const supabase = await createClient();
  const repo = new JournalRepository(supabase);
  const service = new JournalService(repo);
  const result = await service.create(parsed.data);

  if (!result.success) return result;

  revalidatePath("/journals");
  return result;
}
