import { SupabaseClient } from "@supabase/supabase-js";
// import { Database } from '@/types/supabase'

export class FeatureRepository {
  constructor(private readonly supabase: SupabaseClient<any>) {}

  async findById(id: string) {
    const { data, error } = await this.supabase
      .from("table_name")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  // Other database operations...
}
