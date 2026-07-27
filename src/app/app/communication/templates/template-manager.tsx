"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Edit3, Info, Loader2, Copy, Check } from "lucide-react";
import { updateMessageTemplate } from "@/features/communication/actions";
import { ACTION_LABELS, type MessageTemplate } from "@/features/communication/types";

interface TemplateManagerProps {
  initialTemplates: MessageTemplate[];
}

const PLACEHOLDERS = [
  { code: "{{article_title}}", desc: "Judul artikel/naskah" },
  { code: "{{article_abstract}}", desc: "Abstrak naskah" },
  { code: "{{article_doi}}", desc: "DOI naskah (jika ada)" },
  { code: "{{submission_date}}", desc: "Tanggal submit naskah" },
  { code: "{{author_name}}", desc: "Nama penulis naskah" },
  { code: "{{reviewer_name}}", desc: "Nama reviewer" },
  { code: "{{review_deadline}}", desc: "Deadline peninjauan" },
  { code: "{{revision_deadline}}", desc: "Deadline revisi naskah" },
  { code: "{{edition_volume}}", desc: "Volume edisi naskah" },
  { code: "{{edition_number}}", desc: "Nomor edisi naskah" },
  { code: "{{edition_year}}", desc: "Tahun edisi naskah" },
];

export function TemplateManager({ initialTemplates }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>(initialTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(
    initialTemplates[0] || null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    toast.success(`Disalin: ${code}`);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    formData.append("id", selectedTemplate.id);

    try {
      const res = await updateMessageTemplate(formData);
      if (res.success) {
        toast.success("Template berhasil diperbarui");
        // Update local state
        const updatedBody = formData.get("bodyTemplate") as string;
        const updatedSubject = (formData.get("subjectTemplate") as string) || null;

        setTemplates(
          templates.map((t) =>
            t.id === selectedTemplate.id
              ? { ...t, bodyTemplate: updatedBody, subjectTemplate: updatedSubject }
              : t,
          ),
        );
        setSelectedTemplate({
          ...selectedTemplate,
          bodyTemplate: updatedBody,
          subjectTemplate: updatedSubject,
        });
      } else {
        toast.error(res.error || "Gagal menyimpan template");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan pada sistem");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Templates List Sidebar */}
      <div className="space-y-4 lg:col-span-1">
        <h2 className="text-lg font-bold text-foreground">Daftar Template</h2>
        <div className="space-y-3">
          {templates.map((template) => {
            const isSelected = selectedTemplate?.id === template.id;
            const actionLabel = ACTION_LABELS[template.actionCode as any] || template.actionCode;

            return (
              <Card
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`cursor-pointer transition-all duration-200 border ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/50 hover:border-border hover:bg-muted/10"
                }`}
              >
                <CardHeader className="p-4 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {template.channel}
                    </span>
                    <span className="text-[10px] text-muted-foreground">v{template.version}</span>
                  </div>
                  <CardTitle className="text-sm font-bold leading-snug line-clamp-2 pt-1 text-foreground">
                    {actionLabel}
                  </CardTitle>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Template Edit Form & Variable Reference */}
      <div className="lg:col-span-2 space-y-6">
        {selectedTemplate ? (
          <>
            <Card className="glass-card shadow-sm border-border/50">
              <CardHeader className="border-b border-border/40 p-6">
                <CardTitle className="text-lg font-bold text-foreground">
                  Edit Template:{" "}
                  {ACTION_LABELS[selectedTemplate.actionCode as any] || selectedTemplate.actionCode}
                </CardTitle>
                <CardDescription>
                  Sesuaikan subject dan body untuk master template komunikasi ini.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSave} className="space-y-4">
                  {selectedTemplate.channel === "email" && (
                    <div className="space-y-2">
                      <Label htmlFor="subjectTemplate">Subjek Master Template</Label>
                      <Input
                        id="subjectTemplate"
                        name="subjectTemplate"
                        defaultValue={selectedTemplate.subjectTemplate || ""}
                        required
                        className="bg-background/50 border-border/50 font-medium"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="bodyTemplate">Isi Master Template (Body)</Label>
                    <Textarea
                      id="bodyTemplate"
                      name="bodyTemplate"
                      defaultValue={selectedTemplate.bodyTemplate}
                      required
                      className="min-h-[250px] font-mono text-sm leading-relaxed p-4"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Simpan Master Template
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Variable Reference */}
            <Card className="border-border/50 bg-muted/10">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <Info className="h-4 w-4 text-primary" />
                  Daftar Variabel (Placeholder) Yang Tersedia
                </CardTitle>
                <CardDescription className="text-xs">
                  Klik variabel untuk menyalin kode, lalu tempel di subjek atau body template di
                  atas.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {PLACEHOLDERS.map((placeholder, idx) => (
                    <div
                      key={placeholder.code}
                      onClick={() => handleCopy(placeholder.code, idx)}
                      className="flex items-center justify-between p-2 rounded bg-background border border-border/40 hover:bg-muted/20 cursor-pointer group transition-all"
                    >
                      <code className="text-xs font-bold text-primary">{placeholder.code}</code>
                      <span className="text-[11px] text-muted-foreground line-clamp-1 pr-2">
                        {placeholder.desc}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copiedIndex === idx ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-24 border border-dashed rounded-xl bg-muted/5">
            <p className="text-muted-foreground">Pilih template pesan untuk diedit.</p>
          </div>
        )}
      </div>
    </div>
  );
}
