"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";
import { requireRole, getCurrentUserProfile } from "@/features/auth/actions";
import { COMMUNICATION_ACTIONS, type CommunicationAction, type MessageTemplate } from "./types";

// Helper to create admin client
function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

// 1. Get templates
export async function getMessageTemplates(): Promise<MessageTemplate[]> {
  await requireRole(["administrator", "journal_manager", "editor"]);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("message_template")
    .select("*")
    .eq("is_active", true)
    .order("action_code");

  if (error) {
    console.error("Failed to get message templates:", error.message || JSON.stringify(error));
    return [];
  }

  return (data || []).map((t: any) => ({
    id: t.id,
    actionCode: t.action_code,
    channel: t.channel,
    language: t.language,
    variantName: t.variant_name,
    subjectTemplate: t.subject_template,
    bodyTemplate: t.body_template,
    whatsappRegisteredTemplate: t.whatsapp_registered_template,
    version: t.version,
    isActive: t.is_active,
    createdBy: t.created_by,
    createdAt: t.created_at,
  }));
}

// 2. Update template
export async function updateMessageTemplate(formData: FormData) {
  await requireRole(["administrator", "journal_manager"]);
  const supabase = createAdminClient();

  const id = formData.get("id") as string;
  const subjectTemplate = (formData.get("subjectTemplate") as string) || null;
  const bodyTemplate = formData.get("bodyTemplate") as string;

  if (!id || !bodyTemplate) {
    return { success: false, error: "ID dan Body Template wajib diisi." };
  }

  const { error } = await supabase
    .from("message_template")
    .update({
      subject_template: subjectTemplate,
      body_template: bodyTemplate,
      created_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to update message template:", error);
    return { success: false, error: "Gagal memperbarui template." };
  }

  revalidatePath("/app/communication/templates");
  return { success: true };
}

// 3. Get communication history
export async function getCommunicationHistory(articleId?: string): Promise<CommunicationAction[]> {
  await requireRole(["administrator", "journal_manager", "editor"]);
  const supabase = createAdminClient();

  let query = supabase
    .from("communication_action")
    .select(
      `
      *,
      articles (
        judul
      ),
      user_profiles (
        full_name
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (articleId) {
    query = query.eq("article_id", articleId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to get communication history:", error.message || JSON.stringify(error));
    return [];
  }

  // Resolve target names/emails asynchronously or via joins.
  // Since target_id references multiple tables dynamically, we map names in TypeScript
  const actions: CommunicationAction[] = [];

  for (const item of data || []) {
    let targetName = "Tidak Diketahui";
    let targetEmail = "";

    if (item.target_type === "author") {
      const { data: auth } = await supabase
        .from("article_authors")
        .select("nama, email")
        .eq("id", item.target_id)
        .single();
      if (auth) {
        targetName = auth.nama;
        targetEmail = auth.email || "";
      }
    } else if (item.target_type === "reviewer") {
      const { data: rev } = await supabase
        .from("reviewers")
        .select("nama, email")
        .eq("id", item.target_id)
        .single();
      if (rev) {
        targetName = rev.nama;
        targetEmail = rev.email || "";
      }
    } else if (item.target_type === "editorial_member") {
      const { data: prof } = await supabase
        .from("user_profiles")
        .select("full_name")
        .eq("id", item.target_id)
        .single();
      if (prof) {
        targetName = prof.full_name;
      }
    }

    actions.push({
      id: item.id,
      articleId: item.article_id,
      actionCode: item.action_code,
      subStageAtTrigger: item.sub_stage_at_trigger,
      triggeredBy: item.triggered_by,
      targetId: item.target_id,
      targetType: item.target_type,
      channel: item.channel,
      templateId: item.template_id,
      draftContent: item.draft_content,
      finalContent: item.final_content,
      status: item.status,
      failureReason: item.failure_reason,
      providerMessageId: item.provider_message_id,
      createdAt: item.created_at,
      sentAt: item.sent_at,
      article: item.articles ? { judul: item.articles.judul } : undefined,
      triggererProfile: item.user_profiles ? { fullName: item.user_profiles.full_name } : undefined,
      targetName,
      targetEmail,
    });
  }

  return actions;
}

// 4. Prepare draft from template
export async function prepareCommunicationDraft(
  articleId: string,
  actionCode: string,
  targetId: string,
  targetType: "author" | "reviewer" | "editorial_member",
) {
  const profile = await requireRole(["administrator", "journal_manager", "editor"]);
  const supabase = createAdminClient();

  // Find template
  const { data: template, error: tempErr } = await supabase
    .from("message_template")
    .select("*")
    .eq("action_code", actionCode)
    .eq("channel", "email")
    .eq("is_active", true)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  if (tempErr || !template) {
    return { success: false, error: `Template untuk aksi '${actionCode}' tidak ditemukan.` };
  }

  // Fetch article & edition details
  const { data: article, error: artErr } = await supabase
    .from("articles")
    .select(
      `
      *,
      editions (
        volume,
        nomor,
        tahun
      )
    `,
    )
    .eq("id", articleId)
    .single();

  if (artErr || !article) {
    return { success: false, error: "Detail artikel tidak ditemukan." };
  }

  // Fetch target info
  let targetName = "";
  let targetEmail = "";
  if (targetType === "author") {
    const { data: auth } = await supabase
      .from("article_authors")
      .select("nama, email")
      .eq("id", targetId)
      .single();
    if (auth) {
      targetName = auth.nama;
      targetEmail = auth.email || "";
    }
  } else if (targetType === "reviewer") {
    const { data: rev } = await supabase
      .from("reviewers")
      .select("nama, email")
      .eq("id", targetId)
      .single();
    if (rev) {
      targetName = rev.nama;
      targetEmail = rev.email || "";
    }
  } else if (targetType === "editorial_member") {
    const { data: prof } = await supabase
      .from("user_profiles")
      .select("full_name")
      .eq("id", targetId)
      .single();
    if (prof) {
      targetName = prof.full_name;
    }
  }

  // Define dates
  const submissionDate =
    article.tanggal_submit || new Date(article.created_at).toLocaleDateString("id-ID");
  const twoWeeksLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID");

  const edition = Array.isArray(article.editions) ? article.editions[0] : article.editions;

  // Variables map
  const variables: Record<string, string> = {
    "{{article_title}}": article.judul || "",
    "{{article_abstract}}": article.abstrak || "",
    "{{article_doi}}": article.doi || "Belum tersedia",
    "{{submission_date}}": submissionDate,
    "{{author_name}}": targetName,
    "{{reviewer_name}}": targetName,
    "{{review_deadline}}": twoWeeksLater,
    "{{revision_deadline}}": twoWeeksLater,
    "{{edition_volume}}": String(edition?.volume || "11"),
    "{{edition_number}}": String(edition?.nomor || "1"),
    "{{edition_year}}": String(edition?.tahun || "2026"),
  };

  // Replace function
  const fillTemplate = (text: string) => {
    let result = text;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replaceAll(key, value);
    }
    return result;
  };

  const subject = fillTemplate(template.subject_template || "");
  const body = fillTemplate(template.body_template || "");

  const draftText = `Subject: ${subject}\n\n${body}`;

  // Substage mapping based on action code
  let subStage = 0;
  if (actionCode === COMMUNICATION_ACTIONS.NOTIFY_SUBMISSION_RECEIVED) subStage = 1;
  else if (actionCode === COMMUNICATION_ACTIONS.ASSIGN_REVIEWER) subStage = 3;
  else if (actionCode === COMMUNICATION_ACTIONS.REMIND_REVIEWER_DEADLINE) subStage = 3;
  else if (actionCode === COMMUNICATION_ACTIONS.REQUEST_REVISION) subStage = 4;
  else if (actionCode === COMMUNICATION_ACTIONS.NOTIFY_EDITORIAL_DECISION) subStage = 3;
  else if (actionCode === COMMUNICATION_ACTIONS.NOTIFY_PUBLICATION_TO_AUTHOR) subStage = 9;

  // Insert draft in database
  const { data: newAction, error: insertErr } = await supabase
    .from("communication_action")
    .insert({
      article_id: articleId,
      action_code: actionCode,
      sub_stage_at_trigger: subStage,
      triggered_by: profile.id,
      target_id: targetId,
      target_type: targetType,
      channel: "email",
      template_id: template.id,
      draft_content: draftText,
      status: "drafted",
    })
    .select()
    .single();

  if (insertErr || !newAction) {
    console.error("Failed to create draft action:", insertErr);
    return { success: false, error: "Gagal membuat draft pesan." };
  }

  return {
    success: true,
    draft: {
      id: newAction.id,
      subject,
      body,
      targetName,
      targetEmail,
    },
  };
}

// 5. Send communication (mock email execution)
export async function sendCommunication(actionId: string, subject: string, body: string) {
  const profile = await requireRole(["administrator", "journal_manager", "editor"]);
  const supabase = createAdminClient();

  // Get action draft details
  const { data: action, error: actionErr } = await supabase
    .from("communication_action")
    .select("*")
    .eq("id", actionId)
    .single();

  if (actionErr || !action) {
    return { success: false, error: "Draft pesan tidak ditemukan." };
  }

  // Get target email
  let targetEmail = "";
  let targetName = "";
  if (action.target_type === "author") {
    const { data: auth } = await supabase
      .from("article_authors")
      .select("nama, email")
      .eq("id", action.target_id)
      .single();
    if (auth) {
      targetEmail = auth.email || "";
      targetName = auth.nama;
    }
  } else if (action.target_type === "reviewer") {
    const { data: rev } = await supabase
      .from("reviewers")
      .select("nama, email")
      .eq("id", action.target_id)
      .single();
    if (rev) {
      targetEmail = rev.email || "";
      targetName = rev.nama;
    }
  } else if (action.target_type === "editorial_member") {
    const { data: prof } = await supabase
      .from("user_profiles")
      .select("full_name")
      .eq("id", action.target_id)
      .single();
    if (prof) {
      targetName = prof.full_name;
      targetEmail = `${prof.full_name.toLowerCase().replace(/[^a-z0-9]/g, ".")}@risenologi.kpmunj.org`;
    }
  }

  if (!targetEmail) {
    // If no target email, fail transaction
    const failReason = `Email target kosong untuk tipe '${action.target_type}'.`;
    await supabase
      .from("communication_action")
      .update({
        status: "failed",
        failure_reason: failReason,
      })
      .eq("id", actionId);

    return { success: false, error: failReason };
  }

  // ---------------------------------------------------------------------------
  // REAL SMTP EMAIL DISPATCH (GMAIL SMTP - risenologikpm@unj.ac.id)
  // ---------------------------------------------------------------------------
  let providerMessageId = `smtp_${Date.now()}`;
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE !== "false",
      auth: {
        user: process.env.SMTP_USER || "risenologikpm@unj.ac.id",
        pass: process.env.SMTP_PASS || "rbwsmvvnsvtqrnjl",
      },
    });

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || "JAMS Risenologi Editorial Team"}" <${process.env.SMTP_FROM_EMAIL || "risenologikpm@unj.ac.id"}>`,
      to: `${targetName} <${targetEmail}>`,
      subject: subject,
      text: body,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 15px; border: 1px solid #e0e0e0; rounded: 8px;">${body.replace(/\n/g, "<br />")}</div>`,
    };

    const info = await transporter.sendMail(mailOptions);
    if (info && info.messageId) {
      providerMessageId = info.messageId;
    }
    console.log("✅ [REAL GMAIL SMTP DISPATCH SUCCESS] Message ID:", providerMessageId);
  } catch (smtpErr: any) {
    console.error("❌ [REAL GMAIL SMTP DISPATCH FAILED]:", smtpErr?.message || smtpErr);
    const failReason = `Gagal mengirim email via SMTP: ${smtpErr?.message || "Kesalahan koneksi SMTP"}`;
    await supabase
      .from("communication_action")
      .update({
        status: "failed",
        failure_reason: failReason,
      })
      .eq("id", actionId);

    return { success: false, error: failReason };
  }

  const finalContent = `Subject: ${subject}\n\n${body}`;

  const { error: updateErr } = await supabase
    .from("communication_action")
    .update({
      status: "sent",
      final_content: finalContent,
      sent_at: new Date().toISOString(),
      provider_message_id: providerMessageId,
    })
    .eq("id", actionId);

  if (updateErr) {
    console.error("Failed to update action status:", updateErr);
    return {
      success: false,
      error: "Pesan terkirim di sistem tapi gagal memperbarui riwayat database.",
    };
  }

  // Log to Audit Log (canonical audit_logs table)
  const { error: auditErr } = await supabase.from("audit_logs").insert({
    tabel_nama: "articles",
    operasi: "UPDATE",
    entitas_id: action.article_id,
    data_lama: null,
    data_baru: {
      action: "communication_sent",
      action_code: action.action_code,
      channel: "email",
      target_email: targetEmail,
    },
    dilakukan_oleh: profile.id,
    keterangan: `Mengirim email [${action.action_code}] ke ${targetEmail}`,
  });

  if (auditErr) {
    console.error("Failed to write audit log:", auditErr);
  }

  revalidatePath("/app/communication/history");
  revalidatePath("/app/manuscripts");
  return { success: true };
}

// 6. Discard draft
export async function discardCommunicationDraft(actionId: string) {
  await requireRole(["administrator", "journal_manager", "editor"]);
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("communication_action")
    .update({
      status: "discarded",
    })
    .eq("id", actionId);

  if (error) {
    console.error("Failed to discard draft:", error);
    return { success: false, error: "Gagal membuang draft." };
  }

  return { success: true };
}

// 7. Get communication targets (authors of the article and active reviewers of the journal)
export async function getCommunicationTargets(articleId: string) {
  await requireRole(["administrator", "journal_manager", "editor"]);
  const supabase = createAdminClient();

  // 1. Get article authors
  const { data: authors, error: authErr } = await supabase
    .from("article_authors")
    .select("id, nama, email")
    .eq("article_id", articleId)
    .order("urutan");

  if (authErr) {
    console.error("Failed to get article authors:", authErr);
  }

  // 2. Get journal_id via edition of the article
  const { data: article, error: artErr } = await supabase
    .from("articles")
    .select(
      `
      edition_id,
      editions (
        journal_id
      )
    `,
    )
    .eq("id", articleId)
    .single();

  let reviewers: any[] = [];
  if (article && !artErr) {
    const ed = Array.isArray(article.editions) ? article.editions[0] : article.editions;
    const journalId = ed?.journal_id;
    if (journalId) {
      // Fetch active reviewers for this journal
      const { data: revs, error: revErr } = await supabase
        .from("reviewers")
        .select("id, nama, email")
        .eq("journal_id", journalId)
        .eq("status_aktif", true)
        .order("nama");

      if (!revErr && revs) {
        reviewers = revs;
      }
    }
  }

  // 3. Get Section Editors / Editorial Members (user_profiles)
  const { data: editors, error: edErr } = await supabase
    .from("user_profiles")
    .select("id, full_name, role")
    .in("role", ["editor", "journal_manager"])
    .order("full_name");

  if (edErr) {
    console.error("Failed to get editorial members:", edErr);
  }

  const targets = [
    ...(authors || []).map((a: any) => ({
      id: a.id,
      name: a.nama,
      email: a.email || "Tidak ada email",
      role: "Penulis",
      type: "author" as const,
    })),
    ...reviewers.map((r: any) => ({
      id: r.id,
      name: r.nama,
      email: r.email || "Tidak ada email",
      role: "Reviewer",
      type: "reviewer" as const,
    })),
    ...(editors || []).map((e: any) => ({
      id: e.id,
      name: e.full_name,
      email: `${e.full_name.toLowerCase().replace(/[^a-z0-9]/g, ".")}@risenologi.kpmunj.org`,
      role: e.role === "editor" ? "Section Editor" : "Journal Manager",
      type: "editorial_member" as const,
    })),
  ];

  return targets;
}
