"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/features/auth/actions";
import {
  reviewerSchema,
  editorialBoardMemberSchema,
  type ReviewerInput,
  type EditorialBoardMemberInput,
} from "@/features/accreditation/schema";
import { RegistryService } from "./service";
import { ReviewerRepository, EditorialBoardRepository } from "./repository";
import type { Reviewer, EditorialBoardMember } from "@/features/accreditation/types";

// ============================================================================
// Service Initialization
// ============================================================================

async function getRegistryService() {
  const supabase = await createClient();
  const reviewerRepo = new ReviewerRepository(supabase);
  const boardRepo = new EditorialBoardRepository(supabase);
  return new RegistryService(reviewerRepo, boardRepo);
}

// NOTE: Hardcode journalId for now, assuming single journal system (Risenologi)
// In a multi-journal system, this would come from context/session.
const DEFAULT_JOURNAL_ID = "00000000-0000-0000-0000-000000000000"; // To be replaced in real DB

// ============================================================================
// REVIEWER ACTIONS
// ============================================================================

export async function createReviewerAction(input: ReviewerInput) {
  await requireRole(["administrator", "journal_manager"]);

  const parsed = reviewerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const service = await getRegistryService();
  // Using a mock journal ID until actual journal entity is loaded in session
  const res = await service.createReviewer(DEFAULT_JOURNAL_ID, parsed.data);

  if (res.success) {
    revalidatePath("/app/registry/reviewers");
    revalidatePath("/app/dashboard");
  }

  return res;
}

export async function updateReviewerAction(id: string, input: Partial<ReviewerInput>) {
  await requireRole(["administrator", "journal_manager"]);

  // Partial validation
  const parsed = reviewerSchema.partial().safeParse(input);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const service = await getRegistryService();
  const res = await service.updateReviewer(id, parsed.data);

  if (res.success) {
    revalidatePath("/app/registry/reviewers");
    revalidatePath("/app/dashboard");
  }

  return res;
}

export async function deleteReviewerAction(id: string) {
  await requireRole(["administrator", "journal_manager"]);

  const service = await getRegistryService();
  const res = await service.deleteReviewer(id);

  if (res.success) {
    revalidatePath("/app/registry/reviewers");
    revalidatePath("/app/dashboard");
  }

  return res;
}

// ============================================================================
// EDITORIAL BOARD ACTIONS
// ============================================================================

export async function createBoardMemberAction(input: EditorialBoardMemberInput) {
  await requireRole(["administrator", "journal_manager"]);

  const parsed = editorialBoardMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const service = await getRegistryService();
  const res = await service.createBoardMember(DEFAULT_JOURNAL_ID, parsed.data);

  if (res.success) {
    revalidatePath("/app/registry/editors");
    revalidatePath("/app/dashboard");
  }

  return res;
}

export async function updateBoardMemberAction(
  id: string,
  input: Partial<EditorialBoardMemberInput>,
) {
  await requireRole(["administrator", "journal_manager"]);

  const parsed = editorialBoardMemberSchema.partial().safeParse(input);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const service = await getRegistryService();
  const res = await service.updateBoardMember(id, parsed.data);

  if (res.success) {
    revalidatePath("/app/registry/editors");
    revalidatePath("/app/dashboard");
  }

  return res;
}

export async function deleteBoardMemberAction(id: string) {
  await requireRole(["administrator", "journal_manager"]);

  const service = await getRegistryService();
  const res = await service.deleteBoardMember(id);

  if (res.success) {
    revalidatePath("/app/registry/editors");
    revalidatePath("/app/dashboard");
  }

  return res;
}
