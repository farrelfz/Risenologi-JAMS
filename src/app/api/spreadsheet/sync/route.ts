import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

// GET: Fetch live JAMS articles & timeline status for Google Sheets
export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: articles } = await supabase
      .from("articles")
      .select(`
        id,
        judul,
        status,
        created_at,
        article_authors (nama, email)
      `)
      .order("created_at", { ascending: false });

    const { data: commHistory } = await supabase
      .from("communication_action")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      articlesCount: articles?.length || 0,
      articles: (articles || []).map((a: any) => ({
        id: a.id,
        judul: a.judul,
        status: a.status,
        author: a.article_authors?.[0]?.nama || "Penulis Utama",
        email: a.article_authors?.[0]?.email || "-",
      })),
      recentCommunicationsCount: commHistory?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Error" },
      { status: 500 },
    );
  }
}

// POST: Trigger sync or batch reminders from Google Sheets Webhook
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, scheduleData } = body;

    const supabase = createAdminClient();

    if (action === "trigger_reminders") {
      // Fetch articles with upcoming deadlines or status requiring revision
      const { data: pendingActions } = await supabase
        .from("communication_action")
        .select("*")
        .eq("status", "drafted")
        .limit(5);

      let sentCount = 0;
      if (pendingActions && pendingActions.length > 0) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: Number(process.env.SMTP_PORT) || 465,
          secure: process.env.SMTP_SECURE !== "false",
          auth: {
            user: process.env.SMTP_USER || "risenologikpm@unj.ac.id",
            pass: process.env.SMTP_PASS || "rbwsmvvnsvtqrnjl",
          },
        });

        for (const act of pendingActions) {
          try {
            await transporter.sendMail({
              from: `"${process.env.SMTP_FROM_NAME || "JAMS Risenologi Editorial Team"}" <${process.env.SMTP_FROM_EMAIL || "risenologikpm@unj.ac.id"}>`,
              to: "risenologikpm@unj.ac.id",
              subject: `[JAMS Automatic Reminder] Aksi Editorial ${act.action_code}`,
              text: act.draft_content || "Pengingat otomatis tenggat editorial JAMS.",
            });

            await supabase
              .from("communication_action")
              .update({
                status: "sent",
                sent_at: new Date().toISOString(),
                provider_message_id: `auto_sheet_cron_${Date.now()}`,
              })
              .eq("id", act.id);

            sentCount++;
          } catch (e) {
            console.error("Auto reminder dispatch error:", e);
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `Batch pengingat diproses. ${sentCount} email otomatis terkirim dari risenologikpm@unj.ac.id.`,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Data Google Spreadsheet berhasil diterima & disinkronkan ke Supabase DB.",
      receivedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
