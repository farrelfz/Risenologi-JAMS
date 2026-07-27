import type {
  Reviewer,
  EditorialBoardMember,
  ReviewerDiversitySummary,
  EditorialBoardDiversitySummary,
} from "@/features/accreditation/types";
import {
  summarizeReviewerDiversity,
  summarizeEditorialBoardDiversity,
  skorMitraBestari,
  skorDewanPenyunting,
} from "@/features/accreditation/scoring";
import { ReviewerRepository, EditorialBoardRepository } from "./repository";

/**
 * RegistryService
 * Business logic for Editorial Board & Reviewer Registry (Module 2)
 * Non-invasif principle: JAMS stores registry, does NOT replace OJS reviewer portal
 */
export class RegistryService {
  constructor(
    private readonly reviewerRepo: ReviewerRepository,
    private readonly boardRepo: EditorialBoardRepository,
  ) {}

  // --------------------------------------------------------------------------
  // REVIEWER
  // --------------------------------------------------------------------------

  async getReviewerDiversity(journalId: string): Promise<ReviewerDiversitySummary> {
    const reviewers = await this.reviewerRepo.findActiveByJournal(journalId);
    return summarizeReviewerDiversity(reviewers);
  }

  async getReviewerScore(journalId: string, reviewers?: Reviewer[]) {
    const aktif = reviewers ?? (await this.reviewerRepo.findActiveByJournal(journalId));
    return skorMitraBestari(journalId, aktif);
  }

  async createReviewer(
    journalId: string,
    input: Omit<Reviewer, "id" | "journalId" | "createdAt" | "updatedAt">,
  ): Promise<{ success: boolean; data?: Reviewer; error?: string }> {
    // Business rule: kualifikasiInternasional = negara != ID
    const kualifikasiInternasional = input.negara.toUpperCase() !== "ID";
    try {
      const reviewer = await this.reviewerRepo.create(journalId, {
        ...input,
        kualifikasiInternasional,
        negara: input.negara.toUpperCase(),
      });
      return { success: true, data: reviewer };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Gagal menambah reviewer",
      };
    }
  }

  async updateReviewer(
    id: string,
    input: Partial<Omit<Reviewer, "id" | "journalId" | "createdAt" | "updatedAt">>,
  ): Promise<{ success: boolean; data?: Reviewer; error?: string }> {
    const patch = { ...input };
    if (input.negara) {
      patch.negara = input.negara.toUpperCase();
      patch.kualifikasiInternasional = patch.negara !== "ID";
    }
    try {
      const reviewer = await this.reviewerRepo.update(id, patch);
      return { success: true, data: reviewer };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Gagal mengupdate reviewer",
      };
    }
  }

  async deleteReviewer(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.reviewerRepo.delete(id);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Gagal menghapus reviewer",
      };
    }
  }

  async listReviewers(journalId: string): Promise<Reviewer[]> {
    return this.reviewerRepo.findAllByJournal(journalId);
  }

  // --------------------------------------------------------------------------
  // EDITORIAL BOARD
  // --------------------------------------------------------------------------

  async getEditorialBoardDiversity(journalId: string): Promise<EditorialBoardDiversitySummary> {
    const members = await this.boardRepo.findActiveByJournal(journalId);
    return summarizeEditorialBoardDiversity(members);
  }

  async getBoardScore(journalId: string, members?: EditorialBoardMember[]) {
    const aktif = members ?? (await this.boardRepo.findActiveByJournal(journalId));
    return skorDewanPenyunting(journalId, aktif);
  }

  async createBoardMember(
    journalId: string,
    input: Omit<EditorialBoardMember, "id" | "journalId" | "createdAt" | "updatedAt">,
  ): Promise<{ success: boolean; data?: EditorialBoardMember; error?: string }> {
    const kualifikasiInternasional = input.negara.toUpperCase() !== "ID";
    try {
      const member = await this.boardRepo.create(journalId, {
        ...input,
        kualifikasiInternasional,
        negara: input.negara.toUpperCase(),
      });
      return { success: true, data: member };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Gagal menambah anggota",
      };
    }
  }

  async updateBoardMember(
    id: string,
    input: Partial<Omit<EditorialBoardMember, "id" | "journalId" | "createdAt" | "updatedAt">>,
  ): Promise<{ success: boolean; data?: EditorialBoardMember; error?: string }> {
    const patch = { ...input };
    if (input.negara) {
      patch.negara = input.negara.toUpperCase();
      patch.kualifikasiInternasional = patch.negara !== "ID";
    }
    try {
      const member = await this.boardRepo.update(id, patch);
      return { success: true, data: member };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Gagal mengupdate anggota",
      };
    }
  }

  async deleteBoardMember(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.boardRepo.delete(id);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Gagal menghapus anggota",
      };
    }
  }

  async listBoardMembers(journalId: string): Promise<EditorialBoardMember[]> {
    return this.boardRepo.findAllByJournal(journalId);
  }
}
