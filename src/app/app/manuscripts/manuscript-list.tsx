"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  CheckCircle2,
  Circle,
  Eye,
  FileText,
  User,
  BookOpen,
  X,
  Filter,
  Trash2,
  Loader2,
  Pencil,
  Mail,
} from "lucide-react";
import { deleteManuscript, updateManuscript } from "@/features/articles/actions";
import { toast } from "sonner";
import { SendCommunicationDialog } from "@/features/communication/components/send-communication-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ArticleItem {
  id: string;
  judul: string;
  penulis: string;
  emailPenulis?: string;
  noWhatsappPenulis?: string;
  status: string;
  skor: number | null;
  editionStr: string;
  volume?: number;
  nomor?: number;
  tahun?: number;
  abstrak?: string;
  kataKunci?: string[];
  chkJudul: boolean;
  chkNovelty: boolean;
  chkRef: boolean;
  chkAnalisis: boolean;
}

interface ManuscriptListProps {
  initialArticles: ArticleItem[];
}

export function ManuscriptList({ initialArticles }: ManuscriptListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCommOpen, setIsCommOpen] = useState(false);

  const handleCloseModal = () => {
    setSelectedArticle(null);
    setIsEditMode(false);
  };

  const handleUpdate = async (formData: FormData) => {
    if (!selectedArticle) return;
    setIsUpdating(true);
    try {
      const res = await updateManuscript(selectedArticle.id, formData);
      if (res.success) {
        toast.success("Artikel berhasil diperbarui");
        const vol = formData.get("volume")
          ? parseInt(formData.get("volume") as string, 10)
          : selectedArticle.volume || 11;
        const no = formData.get("nomor")
          ? parseInt(formData.get("nomor") as string, 10)
          : selectedArticle.nomor || 1;
        const thn = formData.get("tahun")
          ? parseInt(formData.get("tahun") as string, 10)
          : selectedArticle.tahun || 2026;
        const stat = (formData.get("status") as string) || selectedArticle.status;

        setSelectedArticle({
          ...selectedArticle,
          judul: formData.get("judul") as string,
          penulis: formData.get("penulis") as string,
          abstrak: formData.get("abstrak") as string,
          status: stat === "terbit" ? "Terbit" : stat,
          volume: vol,
          nomor: no,
          tahun: thn,
          editionStr: `Vol ${vol} No ${no} (${thn})`,
        });
        setIsEditMode(false);
      } else {
        toast.error(res.error || "Gagal memperbarui artikel");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan pada sistem");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus artikel ini? Data tidak dapat dikembalikan."))
      return;

    setIsDeleting(true);
    try {
      const res = await deleteManuscript(id);
      if (res.success) {
        toast.success("Artikel berhasil dihapus");
        handleCloseModal();
      } else {
        toast.error(res.error || "Gagal menghapus artikel");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan pada sistem");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredArticles = initialArticles.filter((m) => {
    const matchesSearch =
      m.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.penulis.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || m.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const lower = status.toLowerCase();
    if (lower === "terbit") {
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    } else if (lower === "revisi") {
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    } else if (lower === "review") {
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    }
    return "bg-slate-500/10 text-slate-600 border-slate-500/20";
  };

  return (
    <div className="space-y-6">
      {/* Search & Status Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari naskah berdasarkan judul atau penulis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background/50 border-border/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex h-10 w-full sm:w-48 items-center justify-between rounded-md border border-border/50 bg-background/50 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
          >
            <option value="all">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="revisi">Revisi</option>
            <option value="terbit">Terbit</option>
          </select>
        </div>
      </div>

      {/* Manuscript Cards Grid */}
      <div className="grid gap-4">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-xl bg-muted/10">
            <p className="text-muted-foreground">
              Tidak ada naskah yang sesuai dengan pencarian/filter.
            </p>
          </div>
        ) : (
          filteredArticles.map((m) => (
            <Card
              key={m.id}
              onClick={() => setSelectedArticle(m)}
              className="glass-card hover:border-primary/50 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1.5 flex-1">
                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {m.judul}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                      <User className="h-3.5 w-3.5" />
                      <span>{m.penulis}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Edisi: {m.editionStr}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 text-right shrink-0">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${getStatusBadge(m.status)}`}
                    >
                      {m.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-primary group-hover:bg-primary/10"
                    >
                      <Eye className="mr-1 h-3.5 w-3.5" /> Detail
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-2">
                <div className="flex items-center gap-6 mt-2 border-t border-border/30 pt-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {m.chkJudul ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                    <span>Metadata Dasar</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {m.chkRef ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                    <span>Referensi & Sitasi</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
                    {(() => {
                      const passed = [m.chkJudul, m.chkNovelty, m.chkRef, m.chkAnalisis].filter(
                        Boolean,
                      ).length;
                      return (
                        <span className="text-xs font-semibold text-primary">
                          Kesiapan Akreditasi:{" "}
                          {passed === 4 ? "Terverifikasi" : `${passed}/4 Terpenuhi`}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Manuscript Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in-fade max-h-[90vh] flex flex-col">
            {isEditMode ? (
              <form action={handleUpdate} className="flex flex-col h-full overflow-hidden">
                <div className="flex justify-between items-start p-6 border-b border-border/50 shrink-0">
                  <div className="space-y-1 pr-4">
                    <h2 className="text-xl font-bold leading-tight">Edit Naskah</h2>
                    <p className="text-sm text-muted-foreground">Ubah detail metadata naskah.</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleCloseModal}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Judul Artikel</label>
                    <Input name="judul" defaultValue={selectedArticle.judul} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Penulis (pisahkan dengan koma)
                    </label>
                    <Input name="penulis" defaultValue={selectedArticle.penulis} required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">
                        Email Penulis Utama (Validasi Kontak)
                      </label>
                      <Input
                        name="emailPenulis"
                        type="email"
                        defaultValue={selectedArticle.emailPenulis || "author@risenologi.kpmunj.org"}
                        placeholder="author@risenologi.kpmunj.org"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">
                        No. WhatsApp Penulis
                      </label>
                      <Input
                        name="noWhatsappPenulis"
                        defaultValue={selectedArticle.noWhatsappPenulis || "+6281234567890"}
                        placeholder="+6281234567890"
                      />
                    </div>
                  </div>

                  {/* Penugasan Edisi: Volume, Nomor, Tahun */}
                  <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-muted/20 border border-border/40">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Volume</label>
                      <Input
                        name="volume"
                        type="number"
                        defaultValue={selectedArticle.volume || 11}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Nomor</label>
                      <Input
                        name="nomor"
                        type="number"
                        defaultValue={selectedArticle.nomor || 1}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Tahun</label>
                      <Input
                        name="tahun"
                        type="number"
                        defaultValue={selectedArticle.tahun || 2026}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Status Penerbitan
                    </label>
                    <select
                      name="status"
                      defaultValue={
                        selectedArticle.status.toLowerCase() === "terbit" ? "terbit" : "draft"
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="terbit">Terbit (Published)</option>
                      <option value="draft">Draft (Persiapan)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Abstrak</label>
                    <textarea
                      name="abstrak"
                      defaultValue={selectedArticle.abstrak}
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="p-4 border-t border-border/50 bg-muted/20 flex justify-end gap-3 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditMode(false)}
                    disabled={isUpdating}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Perubahan
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex justify-between items-start p-6 border-b border-border/50 shrink-0">
                  <div className="space-y-1 pr-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold mb-2 ${getStatusBadge(selectedArticle.status)}`}
                    >
                      {selectedArticle.status}
                    </span>
                    <h2 className="text-xl font-bold leading-tight">{selectedArticle.judul}</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCloseModal}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/20 border border-border/50">
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground block">
                        Penulis
                      </span>
                      <span className="text-sm font-medium">{selectedArticle.penulis}</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground block">
                        Edisi Terbitan
                      </span>
                      <span className="text-sm font-medium">{selectedArticle.editionStr}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <FileText className="h-4 w-4 text-primary" /> Abstrak & Ringkasan
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed p-4 rounded-lg bg-muted/10 border border-border/30">
                      {selectedArticle.abstrak || "Abstrak tidak tersedia untuk naskah ini."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-foreground">
                      Checklist Kesiapan Akreditasi Artikel
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                        <span className="text-sm font-medium">
                          1. Judul & Abstrak Sesuai Standar
                        </span>
                        {selectedArticle.chkJudul ? (
                          <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Lulus
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                            <Circle className="h-4 w-4" /> Belum Sesuai
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                        <span className="text-sm font-medium">
                          2. Kebaruan & Novelty Kontribusi
                        </span>
                        {selectedArticle.chkNovelty ? (
                          <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Terverifikasi
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                            <Circle className="h-4 w-4" /> Belum Sesuai
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                        <span className="text-sm font-medium">
                          3. Referensi Primer (&gt;85% Jurnal)
                        </span>
                        {selectedArticle.chkRef ? (
                          <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Sesuai
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                            <Circle className="h-4 w-4" /> Belum Sesuai
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                        <span className="text-sm font-medium">4. Analisis & Simpulan</span>
                        {selectedArticle.chkAnalisis ? (
                          <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Sesuai
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                            <Circle className="h-4 w-4" /> Belum Sesuai
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-border/50 bg-muted/20 flex justify-between gap-3 shrink-0">
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedArticle.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Hapus
                  </Button>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => setIsCommOpen(true)}>
                      <Mail className="mr-2 h-4 w-4" />
                      Hubungi
                    </Button>
                    <Button variant="secondary" onClick={() => setIsEditMode(true)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="outline" onClick={handleCloseModal}>
                      Tutup
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {selectedArticle && (
        <SendCommunicationDialog
          isOpen={isCommOpen}
          onClose={() => setIsCommOpen(false)}
          articleId={selectedArticle.id}
          articleTitle={selectedArticle.judul}
        />
      )}
    </div>
  );
}
