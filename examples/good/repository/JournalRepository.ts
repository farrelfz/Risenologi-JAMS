// ✅ GOOD: Repository with no business logic, clean DB access only
import { SupabaseClient } from "@supabase/supabase-js";

export class JournalRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findAll(): Promise<Journal[]> {
    const { data, error } = await this.supabase
      .from("journals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async findById(id: string): Promise<Journal | null> {
    const { data, error } = await this.supabase.from("journals").select("*").eq("id", id).single();

    if (error) return null;
    return data;
  }

  async create(payload: CreateJournalPayload): Promise<Journal> {
    const { data, error } = await this.supabase.from("journals").insert(payload).select().single();

    if (error) throw new Error(error.message);
    return data;
  }
}
