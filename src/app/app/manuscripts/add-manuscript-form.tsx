"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { addManuscript } from "@/features/articles/actions";
import { toast } from "sonner";

export function AddManuscriptForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = await addManuscript(formData);
      if (result.success) {
        toast.success("Naskah baru berhasil ditambahkan.");
        setOpen(false);
      } else {
        toast.error(result.error || "Terjadi kesalahan.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Naskah
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Naskah Baru</DialogTitle>
            <DialogDescription>
              Masukkan detail naskah secara manual tanpa perlu mengunggah file.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="judul">Judul Artikel</Label>
              <Input id="judul" name="judul" placeholder="Masukkan judul artikel" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="penulis">Penulis (pisahkan dengan koma)</Label>
              <Input
                id="penulis"
                name="penulis"
                placeholder="Contoh: Budi Santoso, Siti Aminah"
                required
              />
            </div>

            {/* Penugasan Edisi: Volume, Nomor, Tahun */}
            <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-muted/20 border border-border/40">
              <div className="grid gap-1">
                <Label htmlFor="volume" className="text-xs">
                  Volume
                </Label>
                <Input id="volume" name="volume" type="number" defaultValue="11" required />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="nomor" className="text-xs">
                  Nomor
                </Label>
                <Input id="nomor" name="nomor" type="number" defaultValue="1" required />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="tahun" className="text-xs">
                  Tahun
                </Label>
                <Input id="tahun" name="tahun" type="number" defaultValue="2026" required />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status Penerbitan</Label>
              <select
                id="status"
                name="status"
                defaultValue="terbit"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="terbit">Terbit (Published)</option>
                <option value="draft">Draft (Persiapan)</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="abstrak">Abstrak (Opsional)</Label>
              <Textarea
                id="abstrak"
                name="abstrak"
                placeholder="Masukkan abstrak jika ada..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Naskah
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
