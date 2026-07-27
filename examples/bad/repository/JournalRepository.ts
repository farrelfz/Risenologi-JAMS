// ❌ BAD: Repository contains business logic and permission checks
import { createClient } from "@/lib/supabase/server"; // ❌ creates its own client

export class JournalRepository {
  async findAll(userRole: string) {
    // ❌ knows about roles
    if (userRole !== "administrator") {
      // ❌ business logic in repository
      throw new Error("Forbidden");
    }
    const supabase = await createClient(); // ❌ creates own connection
    const { data } = await supabase.from("journals").select("*");
    if (!data || data.length === 0) {
      // ❌ application logic
      return { message: "No journals found", data: [] }; // ❌ non-standard return
    }
    return data;
  }
}
