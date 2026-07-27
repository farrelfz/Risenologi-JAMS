import { createClient } from "@/lib/supabase/server";
import type { Reviewer, EditorialBoardMember } from "@/features/accreditation/types";

/**
 * ReviewerRepository
 * Rules (Feature Architecture Blueprint):
 * - NO business logic here — only database access
 * - NO permission checks — handled by RLS + Server Actions
 * - Returns typed entities, throws on DB error
 */
export class ReviewerRepository {
  private supabase: Awaited<ReturnType<typeof createClient>>;

  constructor(supabase: Awaited<ReturnType<typeof createClient>>) {
    this.supabase = supabase;
  }

  async findAllByJournal(journalId: string): Promise<Reviewer[]> {
    const { data, error } = await this.supabase
      .from("reviewers")
      .select("*")
      .eq("journal_id", journalId)
      .order("nama");

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapReviewer);
  }

  async findActiveByJournal(journalId: string): Promise<Reviewer[]> {
    const { data, error } = await this.supabase
      .from("reviewers")
      .select("*")
      .eq("journal_id", journalId)
      .eq("status_aktif", true)
      .order("nama");

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapReviewer);
  }

  async findById(id: string): Promise<Reviewer | null> {
    const { data, error } = await this.supabase.from("reviewers").select("*").eq("id", id).single();

    if (error) return null;
    return mapReviewer(data);
  }

  async create(
    journalId: string,
    payload: Omit<Reviewer, "id" | "journalId" | "createdAt" | "updatedAt">,
  ): Promise<Reviewer> {
    const { data, error } = await this.supabase
      .from("reviewers")
      .insert({
        journal_id: journalId,
        nama: payload.nama,
        email: payload.email,
        afiliasi: payload.afiliasi,
        negara: payload.negara,
        kualifikasi_internasional: payload.kualifikasiInternasional,
        tautan_orcid: payload.tautanOrcid,
        tautan_scopus: payload.tautanScopus,
        tautan_google_scholar: payload.tautanGoogleScholar,
        status_aktif: payload.statusAktif,
        tanggal_bergabung: payload.tanggalBergabung,
        bidang_keahlian: payload.bidangKeahlian,
        catatan: payload.catatan,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapReviewer(data);
  }

  async update(
    id: string,
    payload: Partial<Omit<Reviewer, "id" | "journalId" | "createdAt" | "updatedAt">>,
  ): Promise<Reviewer> {
    const { data, error } = await this.supabase
      .from("reviewers")
      .update({
        ...(payload.nama !== undefined && { nama: payload.nama }),
        ...(payload.email !== undefined && { email: payload.email }),
        ...(payload.afiliasi !== undefined && { afiliasi: payload.afiliasi }),
        ...(payload.negara !== undefined && { negara: payload.negara }),
        ...(payload.kualifikasiInternasional !== undefined && {
          kualifikasi_internasional: payload.kualifikasiInternasional,
        }),
        ...(payload.tautanOrcid !== undefined && { tautan_orcid: payload.tautanOrcid }),
        ...(payload.tautanScopus !== undefined && { tautan_scopus: payload.tautanScopus }),
        ...(payload.tautanGoogleScholar !== undefined && {
          tautan_google_scholar: payload.tautanGoogleScholar,
        }),
        ...(payload.statusAktif !== undefined && { status_aktif: payload.statusAktif }),
        ...(payload.tanggalBergabung !== undefined && {
          tanggal_bergabung: payload.tanggalBergabung,
        }),
        ...(payload.bidangKeahlian !== undefined && { bidang_keahlian: payload.bidangKeahlian }),
        ...(payload.catatan !== undefined && { catatan: payload.catatan }),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapReviewer(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("reviewers").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
}

/**
 * EditorialBoardRepository
 */
export class EditorialBoardRepository {
  private supabase: Awaited<ReturnType<typeof createClient>>;

  constructor(supabase: Awaited<ReturnType<typeof createClient>>) {
    this.supabase = supabase;
  }

  async findAllByJournal(journalId: string): Promise<EditorialBoardMember[]> {
    const { data, error } = await this.supabase
      .from("editorial_board_members")
      .select("*")
      .eq("journal_id", journalId)
      .order("nama");

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapEditorialMember);
  }

  async findActiveByJournal(journalId: string): Promise<EditorialBoardMember[]> {
    const { data, error } = await this.supabase
      .from("editorial_board_members")
      .select("*")
      .eq("journal_id", journalId)
      .eq("status_aktif", true)
      .order("nama");

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapEditorialMember);
  }

  async create(
    journalId: string,
    payload: Omit<EditorialBoardMember, "id" | "journalId" | "createdAt" | "updatedAt">,
  ): Promise<EditorialBoardMember> {
    const { data, error } = await this.supabase
      .from("editorial_board_members")
      .insert({
        journal_id: journalId,
        nama: payload.nama,
        email: payload.email,
        afiliasi: payload.afiliasi,
        negara: payload.negara,
        kualifikasi_internasional: payload.kualifikasiInternasional,
        jabatan: payload.jabatan,
        tautan_orcid: payload.tautanOrcid,
        tautan_scopus: payload.tautanScopus,
        tautan_google_scholar: payload.tautanGoogleScholar,
        status_aktif: payload.statusAktif,
        tanggal_bergabung: payload.tanggalBergabung,
        bidang_keahlian: payload.bidangKeahlian,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapEditorialMember(data);
  }

  async update(
    id: string,
    payload: Partial<Omit<EditorialBoardMember, "id" | "journalId" | "createdAt" | "updatedAt">>,
  ): Promise<EditorialBoardMember> {
    const { data, error } = await this.supabase
      .from("editorial_board_members")
      .update({
        ...(payload.nama !== undefined && { nama: payload.nama }),
        ...(payload.email !== undefined && { email: payload.email }),
        ...(payload.afiliasi !== undefined && { afiliasi: payload.afiliasi }),
        ...(payload.negara !== undefined && { negara: payload.negara }),
        ...(payload.kualifikasiInternasional !== undefined && {
          kualifikasi_internasional: payload.kualifikasiInternasional,
        }),
        ...(payload.jabatan !== undefined && { jabatan: payload.jabatan }),
        ...(payload.statusAktif !== undefined && { status_aktif: payload.statusAktif }),
        ...(payload.bidangKeahlian !== undefined && { bidang_keahlian: payload.bidangKeahlian }),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapEditorialMember(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("editorial_board_members").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
}

// ============================================================================
// MAPPERS (snake_case DB → camelCase TypeScript)
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapReviewer(row: any): Reviewer {
  return {
    id: row.id,
    journalId: row.journal_id,
    nama: row.nama,
    email: row.email ?? undefined,
    afiliasi: row.afiliasi ?? undefined,
    negara: row.negara,
    kualifikasiInternasional: row.kualifikasi_internasional,
    tautanOrcid: row.tautan_orcid ?? undefined,
    tautanScopus: row.tautan_scopus ?? undefined,
    tautanGoogleScholar: row.tautan_google_scholar ?? undefined,
    statusAktif: row.status_aktif,
    tanggalBergabung: row.tanggal_bergabung ?? undefined,
    tanggalTerakhirAktif: row.tanggal_terakhir_aktif ?? undefined,
    bidangKeahlian: row.bidang_keahlian ?? undefined,
    catatan: row.catatan ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEditorialMember(row: any): EditorialBoardMember {
  return {
    id: row.id,
    journalId: row.journal_id,
    nama: row.nama,
    email: row.email ?? undefined,
    afiliasi: row.afiliasi ?? undefined,
    negara: row.negara,
    kualifikasiInternasional: row.kualifikasi_internasional,
    jabatan: row.jabatan ?? undefined,
    tautanOrcid: row.tautan_orcid ?? undefined,
    tautanScopus: row.tautan_scopus ?? undefined,
    tautanGoogleScholar: row.tautan_google_scholar ?? undefined,
    statusAktif: row.status_aktif,
    tanggalBergabung: row.tanggal_bergabung ?? undefined,
    bidangKeahlian: row.bidang_keahlian ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
