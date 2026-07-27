"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, CheckCircle2, Globe, Pencil, Trash2, Search, Loader2, X } from "lucide-react";
import { addReviewer, updateReviewer, deleteReviewer } from "@/features/reviewers/actions";

interface Reviewer {
  id: string;
  nama: string;
  afiliasi: string;
  negara: string;
  email?: string;
  kualifikasiInternasional: boolean;
  statusAktif: boolean;
}

interface ReviewerManagerProps {
  initialReviewers: Reviewer[];
  canEdit: boolean;
}

export function ReviewerManager({ initialReviewers, canEdit }: ReviewerManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingReviewer, setEditingReviewer] = useState<Reviewer | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredReviewers = initialReviewers.filter(
    (r) =>
      r.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.afiliasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.negara.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  async function handleAddSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await addReviewer(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Reviewer berhasil ditambahkan!");
        setIsAddOpen(false);
      }
    });
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateReviewer(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Data reviewer berhasil diperbarui!");
        setEditingReviewer(null);
      }
    });
  }

  async function handleDelete(id: string, nama: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus reviewer "${nama}"?`)) return;

    startTransition(async () => {
      const res = await deleteReviewer(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Reviewer berhasil dihapus.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Top Bar with Search & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari reviewer, afiliasi, atau negara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background/50 border-border/50"
          />
        </div>
        {canEdit && (
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Tambah Reviewer
          </Button>
        )}
      </div>

      {/* Table List */}
      <div className="relative w-full overflow-auto rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm shadow-sm">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b border-border/50 bg-muted/20">
            <tr className="border-b border-border/50 transition-colors">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Nama & Afiliasi
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Negara
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Status Internasional
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Status Aktif
              </th>
              <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {filteredReviewers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Tidak ada reviewer yang ditemukan.
                </td>
              </tr>
            ) : (
              filteredReviewers.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-border/30 transition-all duration-300 hover:bg-muted/30"
                >
                  <td className="p-4 align-middle">
                    <div className="font-semibold text-foreground">{r.nama}</div>
                    <div className="text-xs text-muted-foreground">{r.afiliasi || "-"}</div>
                  </td>
                  <td className="p-4 align-middle">
                    <span className="font-medium px-2 py-0.5 rounded bg-muted text-foreground text-xs uppercase tracking-wider">
                      {r.negara}
                    </span>
                  </td>
                  <td className="p-4 align-middle">
                    {r.kualifikasiInternasional ? (
                      <div className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary border-primary/30">
                        <Globe className="mr-1.5 h-3.5 w-3.5" /> Internasional
                      </div>
                    ) : (
                      <div className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold bg-muted text-muted-foreground border-border/50">
                        Domestik (ID)
                      </div>
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {r.statusAktif ? (
                      <div className="flex items-center gap-1 text-xs font-medium text-green-500">
                        <CheckCircle2 className="h-4 w-4" /> Aktif
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Non-aktif</span>
                    )}
                  </td>
                  <td className="p-4 align-middle text-right">
                    {canEdit && (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingReviewer(r)}
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(r.id, r.nama)}
                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Reviewer Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in-fade">
            <div className="flex justify-between items-center p-6 border-b border-border/50">
              <h2 className="text-xl font-bold">Tambah Mitra Bestari Baru</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsAddOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap & Gelar *</Label>
                <Input id="nama" name="nama" placeholder="mis. Prof. Dr. Ahmad, M.Sc." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="afiliasi">Afiliasi / Institusi *</Label>
                <Input
                  id="afiliasi"
                  name="afiliasi"
                  placeholder="mis. Universitas Negeri Jakarta"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="negara">Kode Negara (ISO 2)*</Label>
                  <Input
                    id="negara"
                    name="negara"
                    defaultValue="ID"
                    placeholder="ID, MY, US, JP, dll."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Opsional)</Label>
                  <Input id="email" name="email" type="email" placeholder="reviewer@domain.com" />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="status_aktif"
                  name="status_aktif"
                  defaultChecked
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="status_aktif" className="cursor-pointer">
                  Status Reviewer Aktif
                </Label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Simpan Reviewer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Reviewer Modal */}
      {editingReviewer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in-fade">
            <div className="flex justify-between items-center p-6 border-b border-border/50">
              <h2 className="text-xl font-bold">Edit Data Reviewer</h2>
              <Button variant="ghost" size="icon" onClick={() => setEditingReviewer(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <input type="hidden" name="id" value={editingReviewer.id} />
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap & Gelar *</Label>
                <Input id="nama" name="nama" defaultValue={editingReviewer.nama} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="afiliasi">Afiliasi / Institusi *</Label>
                <Input
                  id="afiliasi"
                  name="afiliasi"
                  defaultValue={editingReviewer.afiliasi}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="negara">Kode Negara (ISO 2)*</Label>
                  <Input id="negara" name="negara" defaultValue={editingReviewer.negara} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={editingReviewer.email || ""}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="status_aktif"
                  name="status_aktif"
                  defaultChecked={editingReviewer.statusAktif}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="status_aktif" className="cursor-pointer">
                  Status Reviewer Aktif
                </Label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingReviewer(null)}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
