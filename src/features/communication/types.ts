export interface MessageTemplate {
  id: string;
  actionCode: string;
  channel: "email" | "whatsapp";
  language: string;
  variantName: string;
  subjectTemplate: string | null;
  bodyTemplate: string;
  whatsappRegisteredTemplate: string | null;
  version: number;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
}

export interface CommunicationAction {
  id: string;
  articleId: string;
  actionCode: string;
  subStageAtTrigger: number;
  triggeredBy: string;
  targetId: string;
  targetType: "author" | "reviewer" | "editorial_member";
  channel: "email" | "whatsapp";
  templateId?: string;
  draftContent: string;
  finalContent: string | null;
  status: "drafted" | "edited" | "sent" | "failed" | "discarded";
  failureReason: string | null;
  providerMessageId: string | null;
  createdAt: string;
  sentAt: string | null;

  // Joined fields for display
  article?: {
    judul: string;
  };
  triggererProfile?: {
    fullName: string;
  };
  targetName?: string;
  targetEmail?: string;
}

export const COMMUNICATION_ACTIONS = {
  NOTIFY_SUBMISSION_RECEIVED: "notify_submission_received",
  REQUEST_REVISION: "request_revision",
  ASSIGN_REVIEWER: "assign_reviewer",
  REMIND_REVIEWER_DEADLINE: "remind_reviewer_deadline",
  NOTIFY_EDITORIAL_DECISION: "notify_editorial_decision",
  NOTIFY_PUBLICATION_TO_AUTHOR: "notify_publication_to_author",
  ASSIGN_SECTION_EDITOR: "assign_section_editor",
  REMIND_EDITOR_REVIEW: "remind_editor_review",
} as const;

export type CommunicationActionCode =
  (typeof COMMUNICATION_ACTIONS)[keyof typeof COMMUNICATION_ACTIONS];

export const ACTION_LABELS: Record<string, string> = {
  [COMMUNICATION_ACTIONS.NOTIFY_SUBMISSION_RECEIVED]: "Konfirmasi Penerimaan Naskah (Author)",
  [COMMUNICATION_ACTIONS.REQUEST_REVISION]: "Permintaan Revisi Naskah (Author)",
  [COMMUNICATION_ACTIONS.ASSIGN_REVIEWER]: "Penugasan Mitra Bestari (Reviewer)",
  [COMMUNICATION_ACTIONS.REMIND_REVIEWER_DEADLINE]: "Pengingat Batas Waktu Review (Reviewer)",
  [COMMUNICATION_ACTIONS.NOTIFY_EDITORIAL_DECISION]: "Keputusan Editorial Terima Naskah (Author)",
  [COMMUNICATION_ACTIONS.NOTIFY_PUBLICATION_TO_AUTHOR]: "Pemberitahuan Publikasi Online (Author)",
  [COMMUNICATION_ACTIONS.ASSIGN_SECTION_EDITOR]: "Penugasan Section Editor (JM → Editor)",
  [COMMUNICATION_ACTIONS.REMIND_EDITOR_REVIEW]: "Pengingat Progres Screening Editor (JM → Editor)",
};
