"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Save, AlertTriangle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { saveDeskEvaluation } from "@/features/desk-evaluation/actions";

const DESK_ITEMS_DEF = [
  {
    id: "item_1_nama_issn",
    nama: "Nama Jurnal & e-ISSN Valid",
    desc: "Sesuai dengan data ISSN BRIN.",
  },
  {
    id: "item_2_url_benar",
    nama: "URL Terdaftar Benar",
    desc: "URL mengarah ke halaman utama OJS jurnal.",
  },
  {
    id: "item_3_status_sinta",
    nama: "Status Sinta Aktif",
    desc: "Masih dalam masa berlaku atau sedang diajukan kembali.",
  },
  {
    id: "item_4_masa_berlaku",
    nama: "Masa Berlaku Terjaga",
    desc: "Tidak kedaluwarsa tanpa status pengajuan.",
  },
  {
    id: "item_5_etika_cope",
    nama: "Etika Publikasi (COPE)",
    desc: "Ada halaman etika publikasi yang mengacu pada standar COPE.",
  },
  {
    id: "item_6_akun_demo",
    nama: "Akun Demo Asesor",
    desc: "Tersedia akun demo (username/password) untuk asesor login.",
  },
  {
    id: "item_7_frekuensi_terbit",
    nama: "Frekuensi Terbit Konsisten",
    desc: "Sesuai dengan periode yang didaftarkan di ISSN.",
  },
  {
    id: "item_8_min_artikel_pdf",
    nama: "Minimal 5 Artikel & PDF",
    desc: "Setiap edisi wajib memiliki minimal 5 artikel dengan PDF.",
  },
];

interface DeskEvaluationFormProps {
  journalId: string;
  initialData: any | null;
}

export function DeskEvaluationForm({ journalId, initialData }: DeskEvaluationFormProps) {
  const [isPending, startTransition] = useTransition();

  // Initialize state from db
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {};
    DESK_ITEMS_DEF.forEach((item) => {
      state[item.id] = initialData ? !!initialData[item.id] : false;
    });
    return state;
  });

  const allPassed = DESK_ITEMS_DEF.every((item) => checkedItems[item.id]);

  const handleToggle = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  async function clientAction(formData: FormData) {
    formData.append("journal_id", journalId);

    startTransition(async () => {
      const result = await saveDeskEvaluation(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Hasil evaluasi berhasil disimpan.");
      }
    });
  }

  return (
    <form action={clientAction} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Desk Evaluation</h1>
          <p className="text-muted-foreground mt-1">
            Protokol H: 8 syarat mutlak administratif sebelum penilaian substansi.
          </p>
        </div>
        <Button type="submit" disabled={isPending} className="gap-2">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isPending ? "Menyimpan..." : "Simpan Hasil Evaluasi"}
        </Button>
      </div>

      <div className="animate-in-fade" style={{ animationDelay: "100ms" }}>
        {!allPassed ? (
          <Alert className="bg-destructive/10 border-destructive/20 text-destructive mb-6 transition-all">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Desk Evaluation Gagal</AlertTitle>
            <AlertDescription>
              Ada syarat administratif yang belum terpenuhi. Jurnal tidak akan dinilai secara
              substansi oleh asesor jika diajukan saat ini (Otomatis Gugur).
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-green-500/10 border-green-500/20 text-green-600 mb-6 transition-all">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Desk Evaluation Lulus</AlertTitle>
            <AlertDescription>
              Seluruh 8 syarat administratif terpenuhi. Jurnal siap untuk tahap penilaian substansi.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {DESK_ITEMS_DEF.map((item) => {
            const isPassed = checkedItems[item.id];
            return (
              <Card
                key={item.id}
                className={`glass-card transition-colors duration-300 ${isPassed ? "border-green-500/30 bg-green-500/5" : "border-destructive/30 bg-destructive/5"}`}
              >
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-medium">{item.nama}</CardTitle>
                    <CardDescription className="text-xs">{item.desc}</CardDescription>
                  </div>
                  <div className="mt-1">
                    {isPassed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      id={item.id}
                      name={item.id}
                      checked={isPassed}
                      onChange={() => handleToggle(item.id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor={item.id} className="text-sm cursor-pointer select-none">
                      Tandai sebagai terpenuhi
                    </Label>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </form>
  );
}
