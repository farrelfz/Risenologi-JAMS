"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw, Send, CheckCircle2, Loader2, FileSpreadsheet, ExternalLink, Zap } from "lucide-react";

interface SpreadsheetSyncControlProps {
  webhookUrl: string;
}

export function SpreadsheetSyncControl({ webhookUrl }: SpreadsheetSyncControlProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isReminding, setIsReminding] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const handleSyncToSpreadsheet = async () => {
    setIsSyncing(true);
    try {
      // 1. Fetch live articles from JAMS API
      const apiRes = await fetch("/api/spreadsheet/sync");
      const apiData = await apiRes.json();

      // 2. Post payload to Google Apps Script Web App Endpoint
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "sync_from_jams",
            data: apiData,
            timestamp: new Date().toISOString(),
          }),
        });
      }

      setLastSync(new Date().toLocaleTimeString("id-ID"));
      toast.success("✅ Sinkronisasi otomatis ke Google Spreadsheet berhasil dipicu!");
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal menyingkronkan data ke Google Spreadsheet.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTriggerReminders = async () => {
    setIsReminding(true);
    try {
      const res = await fetch("/api/spreadsheet/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger_reminders" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Pengingat otomatis berhasil dikirim dari risenologikpm@unj.ac.id!");
      } else {
        toast.error(data.error || "Gagal memproses pengingat.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsReminding(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Integrasi 2-Arah Google Spreadsheet Active
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {lastSync ? `Terakhir disinkronkan pukul ${lastSync}` : "Data terhubung langsung ke Vercel, Supabase DB & Google Sheets Web App."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            size="sm"
            onClick={handleSyncToSpreadsheet}
            disabled={isSyncing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm text-xs"
          >
            {isSyncing ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Menyingkronkan...
              </>
            ) : (
              <>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Sync Ke Spreadsheet
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleTriggerReminders}
            disabled={isReminding}
            className="border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 text-xs"
          >
            {isReminding ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Diproses...
              </>
            ) : (
              <>
                <Zap className="mr-1.5 h-3.5 w-3.5" /> Kirim Pengingat Editorial
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
