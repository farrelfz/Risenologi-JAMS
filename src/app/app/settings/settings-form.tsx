"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Building2, Globe, Target, Loader2, Bookmark, FileText } from "lucide-react";
import { updateJournalSettings } from "@/features/journal/actions";
import { Input } from "@/components/ui/input";

export function SettingsForm({ initialData }: { initialData: any }) {
  const [isPending, startTransition] = useTransition();

  async function clientAction(formData: FormData) {
    if (initialData?.id) {
      formData.append("id", initialData.id);
    }

    startTransition(async () => {
      const result = await updateJournalSettings(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Identitas jurnal berhasil diperbarui.");
      }
    });
  }

  const inputClassName =
    "flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all focus:bg-background";

  return (
    <form
      action={clientAction}
      className="space-y-6 animate-in-fade w-full max-w-4xl"
      style={{ animationDelay: "100ms" }}
    >
      <Card className="glass-card border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-xl text-foreground">Identitas Jurnal</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Informasi dasar jurnal sesuai dengan portal ARJUNA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <label htmlFor="nama" className="text-sm font-medium text-foreground">
              Nama Jurnal
            </label>
            <Input
              id="nama"
              name="nama"
              defaultValue={
                initialData?.nama ||
                "Risenologi : Jurnal Sains, Teknologi, Sosial, Pendidikan, dan Bahasa"
              }
              required
              className={inputClassName}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <label htmlFor="e_issn" className="text-sm font-medium text-foreground">
                e-ISSN
              </label>
              <Input
                id="e_issn"
                name="e_issn"
                defaultValue={initialData?.e_issn || "27209571"}
                className={inputClassName}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="p_issn" className="text-sm font-medium text-foreground">
                p-ISSN
              </label>
              <Input
                id="p_issn"
                name="p_issn"
                defaultValue={initialData?.p_issn || "25025643"}
                className={inputClassName}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <label htmlFor="tahun_terbit" className="text-sm font-medium text-foreground">
                Tahun Terbit
              </label>
              <Input
                id="tahun_terbit"
                name="tahun_terbit"
                defaultValue={initialData?.tahun_terbit || "2016"}
                className={inputClassName}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="frekuensi_terbitan" className="text-sm font-medium text-foreground">
                Frekuensi Terbitan
              </label>
              <select
                id="frekuensi_terbitan"
                name="frekuensi_terbitan"
                defaultValue={initialData?.frekuensi_terbitan || "6 Bulanan"}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all focus:bg-background"
              >
                <option value="1 Bulanan">1 Bulanan</option>
                <option value="2 Bulanan">2 Bulanan</option>
                <option value="3 Bulanan">3 Bulanan</option>
                <option value="4 Bulanan">4 Bulanan</option>
                <option value="6 Bulanan">6 Bulanan</option>
                <option value="Tahunan">Tahunan</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-xl text-foreground">Detail Lembaga & Kontak</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Alamat sekretariat, penerbit, dan URL website pengelola jurnal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <label htmlFor="penerbit" className="text-sm font-medium text-foreground">
              Penerbit / Lembaga
            </label>
            <Input
              id="penerbit"
              name="penerbit"
              defaultValue={initialData?.penerbit || ""}
              className={inputClassName}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="url_situs" className="text-sm font-medium text-foreground">
              URL Website Jurnal (OJS)
            </label>
            <Input
              id="url_situs"
              name="url_situs"
              type="url"
              defaultValue={initialData?.url_situs || ""}
              className={inputClassName}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="alamat_surat" className="text-sm font-medium text-foreground">
              Alamat Surat / Sekretariat
            </label>
            <textarea
              id="alamat_surat"
              name="alamat_surat"
              defaultValue={
                initialData?.alamat_surat ||
                "Sekretariat Kelompok Peneliti Muda Kampus A Universitas Negeri Jakarta Gedung G, Lantai 1, Ruang 106 Jalan Rawamangun Muka No.1 Rawamangun-Pulogadung Jakarta Timur, 13220, Indonesia"
              }
              className="flex w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all min-h-[100px] resize-y"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-xl text-foreground">Status Akreditasi Jurnal</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Rekam jejak dan status penilaian akreditasi (Sinta).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <label htmlFor="status_akreditasi" className="text-sm font-medium text-foreground">
                Status Akreditasi Saat Ini
              </label>
              <select
                id="status_akreditasi"
                name="status_akreditasi"
                defaultValue={
                  initialData?.status_akreditasi || "Terakreditasi Peringkat: 4 (Empat)"
                }
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all focus:bg-background"
              >
                <option value="Belum Terakreditasi">Belum Terakreditasi</option>
                <option value="Terakreditasi Peringkat: 1 (Satu)">
                  Terakreditasi Peringkat: 1 (Satu)
                </option>
                <option value="Terakreditasi Peringkat: 2 (Dua)">
                  Terakreditasi Peringkat: 2 (Dua)
                </option>
                <option value="Terakreditasi Peringkat: 3 (Tiga)">
                  Terakreditasi Peringkat: 3 (Tiga)
                </option>
                <option value="Terakreditasi Peringkat: 4 (Empat)">
                  Terakreditasi Peringkat: 4 (Empat)
                </option>
                <option value="Terakreditasi Peringkat: 5 (Lima)">
                  Terakreditasi Peringkat: 5 (Lima)
                </option>
                <option value="Terakreditasi Peringkat: 6 (Enam)">
                  Terakreditasi Peringkat: 6 (Enam)
                </option>
              </select>
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="total_nilai_akreditasi"
                className="text-sm font-medium text-foreground"
              >
                Total Nilai Akreditasi
              </label>
              <Input
                id="total_nilai_akreditasi"
                name="total_nilai_akreditasi"
                type="number"
                step="0.01"
                defaultValue={initialData?.total_nilai_akreditasi || "51.25"}
                className={inputClassName}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <label htmlFor="status_progres" className="text-sm font-medium text-foreground">
                Status Progres (ARJUNA)
              </label>
              <select
                id="status_progres"
                name="status_progres"
                defaultValue={initialData?.status_progres || "Proses Akreditasi Jurnal Selesai"}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all focus:bg-background"
              >
                <option value="Persiapan Pengajuan">Persiapan Pengajuan</option>
                <option value="Sedang Dievaluasi">Sedang Dievaluasi</option>
                <option value="Menunggu Penilaian">Menunggu Penilaian</option>
                <option value="Proses Akreditasi Jurnal Selesai">
                  Proses Akreditasi Jurnal Selesai
                </option>
              </select>
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="tanggal_terakhir_diajukan"
                className="text-sm font-medium text-foreground"
              >
                Tanggal Terakhir Diajukan
              </label>
              <Input
                id="tanggal_terakhir_diajukan"
                name="tanggal_terakhir_diajukan"
                defaultValue={initialData?.tanggal_terakhir_diajukan || "29 Jun 2023"}
                className={inputClassName}
              />
            </div>
          </div>

          <div className="grid gap-2 pt-4 border-t border-border/30">
            <label htmlFor="target_sinta" className="text-sm font-bold text-primary">
              Target Peringkat Selanjutnya
            </label>
            <p className="text-xs text-muted-foreground mb-1">
              Pilih target Sinta untuk periode pengajuan berikutnya.
            </p>
            <select
              id="target_sinta"
              name="target_sinta"
              defaultValue={initialData?.target_sinta || "sinta_3"}
              className="flex h-10 w-full md:w-1/2 items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all focus:bg-background"
            >
              <option value="sinta_1">Sinta 1</option>
              <option value="sinta_2">Sinta 2</option>
              <option value="sinta_3">Sinta 3</option>
              <option value="sinta_4">Sinta 4</option>
              <option value="sinta_5">Sinta 5</option>
              <option value="sinta_6">Sinta 6</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4 pb-12">
        <Button
          type="button"
          variant="outline"
          className="border-border/50 bg-background/50 hover:bg-background/80"
          disabled={isPending}
        >
          Batal
        </Button>
        <Button type="submit" className="gap-2" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}
