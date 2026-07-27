"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Eye,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  FileText,
} from "lucide-react";
import { ACTION_LABELS, type CommunicationAction } from "@/features/communication/types";

interface HistoryListProps {
  initialHistory: CommunicationAction[];
}

export function HistoryList({ initialHistory }: HistoryListProps) {
  const [history, setHistory] = useState<CommunicationAction[]>(initialHistory);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAction, setSelectedAction] = useState<CommunicationAction | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "failed":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "drafted":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "discarded":
        return "bg-slate-500/10 text-slate-600 border-slate-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      (item.article?.judul || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.targetName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.targetEmail || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari berdasarkan judul naskah, nama penerima, atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background/50 border-border/50"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex h-10 w-full sm:w-48 items-center justify-between rounded-md border border-border/50 bg-background/50 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
        >
          <option value="all">Semua Status</option>
          <option value="sent">Terkirim</option>
          <option value="failed">Gagal</option>
          <option value="drafted">Draft</option>
          <option value="discarded">Dibuang</option>
        </select>
      </div>

      {/* History Grid */}
      <div className="grid gap-4">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-xl bg-muted/10">
            <p className="text-muted-foreground">Tidak ada riwayat komunikasi yang cocok.</p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <Card
              key={item.id}
              onClick={() => setSelectedAction(item)}
              className="glass-card hover:border-primary/40 transition-all duration-200 cursor-pointer shadow-sm"
            >
              <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${getStatusBadge(item.status)}`}
                    >
                      {getStatusIcon(item.status)}
                      <span className="ml-0.5">{item.status}</span>
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {new Date(item.createdAt).toLocaleString("id-ID")}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground line-clamp-1 leading-snug">
                    {item.article?.judul || "Naskah Tidak Ditemukan"}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      Penerima: {item.targetName} (
                      {item.targetType === "author" ? "Penulis" : "Reviewer"})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {item.targetEmail || "-"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0 w-full md:w-auto text-right">
                  <span className="text-xs font-semibold text-primary/80 block">
                    {ACTION_LABELS[item.actionCode as any] || item.actionCode}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-primary bg-primary/5 hover:bg-primary/10"
                  >
                    <Eye className="mr-1 h-3.5 w-3.5" /> Lihat Pesan
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* View Message Detail Modal */}
      {selectedAction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-start p-6 border-b border-border/50 shrink-0">
              <div className="space-y-1 pr-4">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase mb-2 ${getStatusBadge(selectedAction.status)}`}
                >
                  {getStatusIcon(selectedAction.status)}
                  <span>{selectedAction.status}</span>
                </span>
                <h2 className="text-xl font-bold leading-tight">Detail Log Komunikasi</h2>
                <p className="text-xs text-muted-foreground">
                  Dikirim oleh:{" "}
                  <span className="font-semibold text-foreground">
                    {selectedAction.triggererProfile?.fullName || "Sistem"}
                  </span>{" "}
                  pada {new Date(selectedAction.createdAt).toLocaleString("id-ID")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedAction(null)}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Context Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/20 border border-border/50">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Penerima
                  </span>
                  <span className="text-sm font-semibold">{selectedAction.targetName}</span>
                  <span className="text-xs text-muted-foreground block">
                    {selectedAction.targetEmail}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Jenis Aksi
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {ACTION_LABELS[selectedAction.actionCode as any] || selectedAction.actionCode}
                  </span>
                  <span className="text-xs text-muted-foreground block">
                    Saluran: {selectedAction.channel.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <FileText className="h-4 w-4 text-primary" />
                  Isi Surat / Pesan
                </h3>
                <div className="p-4 rounded-lg bg-muted/10 border border-border/30 font-mono text-sm leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {selectedAction.finalContent || selectedAction.draftContent}
                </div>
              </div>

              {/* Delivery Details */}
              {selectedAction.status === "failed" && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Penyebab Kegagalan:</strong>
                    <span>
                      {selectedAction.failureReason || "Kesalahan pengiriman tidak diketahui."}
                    </span>
                  </div>
                </div>
              )}

              {selectedAction.providerMessageId && (
                <div className="text-[10px] text-muted-foreground text-right">
                  Provider Message ID:{" "}
                  <span className="font-mono">{selectedAction.providerMessageId}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border/50 bg-muted/20 flex justify-end shrink-0">
              <Button variant="outline" onClick={() => setSelectedAction(null)}>
                Tutup Log
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
