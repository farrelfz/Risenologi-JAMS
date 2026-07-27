// ❌ BAD: Service directly accesses database and handles HTTP
import { createClient } from "@supabase/supabase-js"; // ❌ direct DB
import { NextResponse } from "next/server"; // ❌ HTTP in service

export class JournalService {
  async create(payload: any) {
    const supabase = createClient(process.env.URL!, process.env.KEY!); // ❌
    const { data, error } = await supabase.from("journals").insert(payload); // ❌

    if (error) {
      return NextResponse.json({ error }, { status: 500 }); // ❌ HTTP response in service
    }
    return NextResponse.json({ data }); // ❌
  }
}
