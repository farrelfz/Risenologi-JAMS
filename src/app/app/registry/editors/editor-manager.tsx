"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, CheckCircle2, Globe, Pencil, Trash2, Search, Loader2, X } from "lucide-react";
import { addEditor, updateEditor, deleteEditor } from "@/features/editorial-board/actions";

interface Editor {
  id: string;
  nama: string;
  jabatan: string;
  afiliasi: string;
  negara: string;
  email?: string;
  kualifikasiInternasional: boolean;
  statusAktif: boolean;
}

interface EditorManagerProps {
  initialEditors: Editor[];
  canEdit: boolean;
}

export function EditorManager({ initialEditors, canEdit }: EditorManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEditor, setEditingEditor] = useState<Editor | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredEditors = initialEditors.filter(
    (e) =>
      e.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.afiliasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.negara.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  async function handleAddSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await addEditor(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Anggota dewan penyunting berhasil ditambahkan!");
        setIsAddOpen(false);
      }
    });
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateEditor(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Data editor berhasil diperbarui!");
        setEditingEditor(null);
      }
    });
  }

  async function handleDelete(id: string, nama: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus editor "${nama}"?`)) return;

    startTransition(async () => {
      const res = await deleteEditor(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Editor berhasil dihapus.");
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
            placeholder="Cari nama, jabatan, afiliasi, atau negara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background/50 border-border/50"
          />
        </div>
        {canEdit && (
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Tambah Editor
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
                Jabatan
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Negara
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Status Internasional
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Aktif
              </th>
              <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {filteredEditors.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  Tidak ada editor yang ditemukan.
                </td>
              </tr>
            ) : (
              filteredEditors.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-border/30 transition-all duration-300 hover:bg-muted/30"
                >
                  <td className="p-4 align-middle">
                    <div className="font-semibold text-foreground">{e.nama}</div>
                    <div className="text-xs text-muted-foreground">{e.afiliasi || "-"}</div>
                  </td>
                  <td className="p-4 align-middle">
                    <span className="inline-flex items-center rounded bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-semibold">
                      {e.jabatan}
                    </span>
                  </td>
                  <td className="p-4 align-middle">
                    <span className="font-medium px-2 py-0.5 rounded bg-muted text-foreground text-xs uppercase tracking-wider">
                      {e.negara}
                    </span>
                  </td>
                  <td className="p-4 align-middle">
                    {e.kualifikasiInternasional ? (
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
                    {e.statusAktif ? (
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
                          onClick={() => setEditingEditor(e)}
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(e.id, e.nama)}
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

      {/* Add Editor Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in-fade">
            <div className="flex justify-between items-center p-6 border-b border-border/50">
              <h2 className="text-xl font-bold">Tambah Dewan Penyunting Baru</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsAddOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap & Gelar *</Label>
                <Input id="nama" name="nama" placeholder="mis. Dr. Rina Wati, M.Si." required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jabatan">Jabatan Editor *</Label>
                  <Input
                    id="jabatan"
                    name="jabatan"
                    defaultValue="Section Editor"
                    placeholder="mis. Editor in Chief"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="negara">Kode Negara (ISO 2)*</Label>
                  <Input
                    id="negara"
                    name="negara"
                    defaultValue="ID"
                    placeholder="ID, MY, JP, US, dll."
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="afiliasi">Afiliasi / Institusi *</Label>
                <Input
                  id="afiliasi"
                  name="afiliasi"
                  placeholder="mis. Universitas Indonesia"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Opsional)</Label>
                <Input id="email" name="email" type="email" placeholder="editor@domain.com" />
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
                  Status Editor Aktif
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
                  Simpan Editor
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Editor Modal */}
      {editingEditor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in-fade">
            <div className="flex justify-between items-center p-6 border-b border-border/50">
              <h2 className="text-xl font-bold">Edit Data Dewan Penyunting</h2>
              <Button variant="ghost" size="icon" onClick={() => setEditingEditor(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <input type="hidden" name="id" value={editingEditor.id} />
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap & Gelar *</Label>
                <Input id="nama" name="nama" defaultValue={editingEditor.nama} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jabatan">Jabatan Editor *</Label>
                  <Input
                    id="jabatan"
                    name="jabatan"
                    defaultValue={editingEditor.jabatan}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="negara">Kode Negara (ISO 2)*</Label>
                  <Input id="negara" name="negara" defaultValue={editingEditor.negara} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="afiliasi">Afiliasi / Institusi *</Label>
                <Input
                  id="afiliasi"
                  name="afiliasi"
                  defaultValue={editingEditor.afiliasi}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingEditor.email || ""}
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="status_aktif"
                  name="status_aktif"
                  defaultChecked={editingEditor.statusAktif}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="status_aktif" className="cursor-pointer">
                  Status Editor Aktif
                </Label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingEditor(null)}
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
