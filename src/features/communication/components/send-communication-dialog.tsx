"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, Send, X, AlertCircle, Search, UserCheck, ShieldCheck, Check } from "lucide-react";
import {
  getCommunicationTargets,
  prepareCommunicationDraft,
  sendCommunication,
  discardCommunicationDraft,
} from "../actions";
import { ACTION_LABELS, COMMUNICATION_ACTIONS } from "../types";

interface Target {
  id: string;
  name: string;
  email: string;
  role?: string;
  type: "author" | "reviewer" | "editorial_member";
}

interface SendCommunicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: string;
  articleTitle: string;
}

export function SendCommunicationDialog({
  isOpen,
  onClose,
  articleId,
  articleTitle,
}: SendCommunicationDialogProps) {
  const [targets, setTargets] = useState<Target[]>([]);
  const [targetSearch, setTargetSearch] = useState<string>("");
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");
  const [selectedActionCode, setSelectedActionCode] = useState<string>("");
  const [isLoadingTargets, setIsLoadingTargets] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Draft data from backend
  const [draftId, setDraftId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [targetEmail, setTargetEmail] = useState("");

  // Load targets when open
  useEffect(() => {
    if (isOpen && articleId) {
      setIsLoadingTargets(true);
      getCommunicationTargets(articleId)
        .then((res) => {
          setTargets(res);
          if (res.length > 0) {
            setSelectedTargetId(res[0].id);
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Gagal mengambil daftar penerima.");
        })
        .finally(() => {
          setIsLoadingTargets(false);
        });
    }
  }, [isOpen, articleId]);

  if (!isOpen) return null;

  const handleClose = async () => {
    if (draftId) {
      await discardCommunicationDraft(draftId).catch(console.error);
    }
    setDraftId(null);
    setSubject("");
    setBody("");
    setSelectedActionCode("");
    setTargetEmail("");
    setTargetSearch("");
    onClose();
  };

  const handleActionChange = async (actionCode: string) => {
    setSelectedActionCode(actionCode);
    const target = targets.find((t) => t.id === selectedTargetId);
    if (!target) {
      toast.error("Pilih penerima pesan terlebih dahulu.");
      return;
    }

    setIsDrafting(true);
    try {
      const res = await prepareCommunicationDraft(articleId, actionCode, target.id, target.type);
      if (res.success && res.draft) {
        setDraftId(res.draft.id);
        setSubject(res.draft.subject);
        setBody(res.draft.body);
        setTargetEmail(res.draft.targetEmail || target.email);
      } else {
        toast.error(res.error || "Gagal menyiapkan draft pesan.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat menyiapkan draft.");
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSend = async () => {
    if (!draftId) return;
    if (!subject.trim()) {
      toast.error("Subjek email tidak boleh kosong.");
      return;
    }
    if (!body.trim()) {
      toast.error("Isi email tidak boleh kosong.");
      return;
    }

    setIsSending(true);
    try {
      const res = await sendCommunication(draftId, subject, body);
      if (res.success) {
        toast.success("Email berhasil dikirim (mencatat pengiriman di system logs).");
        setDraftId(null);
        onClose();
      } else {
        toast.error(res.error || "Gagal mengirim email.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan pada sistem pengiriman.");
    } finally {
      setIsSending(false);
    }
  };

  const filteredTargets = targets.filter(
    (t) =>
      t.name.toLowerCase().includes(targetSearch.toLowerCase()) ||
      t.email.toLowerCase().includes(targetSearch.toLowerCase()) ||
      (t.role || "").toLowerCase().includes(targetSearch.toLowerCase()),
  );

  const selectedTarget = targets.find((t) => t.id === selectedTargetId);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-border/50 shrink-0">
          <div className="space-y-1 pr-4">
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary mb-1">
              <Mail className="h-3.5 w-3.5" /> Komunikasi Editorial
            </span>
            <h2 className="text-xl font-bold leading-tight">Hubungi Tim & Kontributor</h2>
            <p className="text-xs text-muted-foreground line-clamp-1">
              Artikel: <span className="font-semibold text-foreground">{articleTitle}</span>
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {isLoadingTargets ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm">Memuat daftar penerima...</span>
            </div>
          ) : (
            <>
              {/* Searchable Target Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-foreground">
                    1. Cari & Pilih Penerima Pesan
                  </Label>
                  <span className="text-[10px] text-muted-foreground">
                    Ditemukan: {filteredTargets.length} Kontak
                  </span>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama, email, atau peran (Section Editor, Journal Manager, Penulis, Reviewer)..."
                    value={targetSearch}
                    onChange={(e) => setTargetSearch(e.target.value)}
                    className="pl-9 bg-background/50 border-border/60 text-xs"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto rounded-lg border border-border/50 bg-muted/10 divide-y divide-border/30">
                  {filteredTargets.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      Penerima tidak ditemukan dengan kata kunci tersebut.
                    </div>
                  ) : (
                    filteredTargets.map((t) => {
                      const isSelected = selectedTargetId === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => {
                            setSelectedTargetId(t.id);
                            if (draftId) {
                              discardCommunicationDraft(draftId).catch(console.error);
                              setDraftId(null);
                              setSubject("");
                              setBody("");
                            }
                            setSelectedActionCode("");
                          }}
                          className={`p-3 flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? "bg-primary/10 border-l-4 border-l-primary"
                              : "hover:bg-muted/30"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-foreground">
                                {t.name}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                                  t.type === "editorial_member"
                                    ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                    : t.type === "reviewer"
                                      ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                      : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                }`}
                              >
                                {t.role || t.type}
                              </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground block">
                              {t.email}
                            </span>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Action Selector */}
              {selectedTargetId && (
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <Label htmlFor="action" className="text-sm font-bold text-foreground">
                    2. Pilih Jenis Aksi Komunikasi
                  </Label>
                  <Select value={selectedActionCode} onValueChange={handleActionChange}>
                    <SelectTrigger id="action">
                      <SelectValue placeholder="Pilih tindakan komunikasi..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ACTION_LABELS).map(([code, label]) => {
                        const target = selectedTarget;
                        const isReviewerAction = code.includes("reviewer");
                        const isAuthorAction =
                          code.includes("submission") ||
                          code.includes("revision") ||
                          code.includes("editorial_decision") ||
                          code.includes("publication");
                        const isInternalAction =
                          code.includes("section_editor") || code.includes("editor_review");

                        if (target?.type === "author" && !isAuthorAction) return null;
                        if (target?.type === "reviewer" && !isReviewerAction) return null;
                        if (target?.type === "editorial_member" && !isInternalAction) return null;

                        return (
                          <SelectItem key={code} value={code}>
                            {label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Target & Channel Info Badge */}
              {selectedTarget && (
                <div className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/20 border border-border/40 flex items-center justify-between flex-wrap gap-2">
                  <span>
                    Email Target:{" "}
                    <strong className="text-foreground">{selectedTarget.email}</strong>
                  </span>
                  <span className="uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                    Saluran: Email (SMTP)
                  </span>
                </div>
              )}

              {/* Drafting Loader */}
              {isDrafting && (
                <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-xs">Menyiapkan draft otomatis dari master template...</span>
                </div>
              )}

              {/* Editable Draft Area */}
              {draftId && !isDrafting && (
                <div className="space-y-4 pt-2 border-t border-border/40">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subjek Email</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Subjek email..."
                      className="font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="body">Isi Email (Dapat Diedit)</Label>
                    <Textarea
                      id="body"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Tulis pesan Anda di sini..."
                      className="min-h-[200px] leading-relaxed resize-y font-mono text-sm p-4"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-600 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      Pesan ini adalah draft yang diisi otomatis dari master template. Anda dapat
                      merapikan, menambahkan catatan khusus, atau menyesuaikan kalimat di atas
                      sebelum mengklik kirim.
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 bg-muted/20 flex justify-end gap-3 shrink-0">
          <Button variant="outline" onClick={handleClose} disabled={isSending}>
            Batal
          </Button>
          <Button
            onClick={handleSend}
            disabled={!draftId || isSending || isDrafting}
            className="shadow-sm"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Kirim Email Sekarang
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
