"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  ClipboardCheck,
  BarChart3,
  Clock,
  BookOpen,
  Zap,
  Sparkles,
  Mail,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/features/accreditation/types";

interface SidebarProps {
  profile: Pick<UserProfile, "role">;
  targetSinta?: string | null;
  currentScore?: number;
}

const sintaTargetMap: Record<string, { label: string; minScore: number }> = {
  sinta_1: { label: "Sinta 1", minScore: 85.0 },
  sinta_2: { label: "Sinta 2", minScore: 70.0 },
  sinta_3: { label: "Sinta 3", minScore: 60.0 },
  sinta_4: { label: "Sinta 4", minScore: 50.0 },
  sinta_5: { label: "Sinta 5", minScore: 40.0 },
  sinta_6: { label: "Sinta 6", minScore: 30.0 },
};

const NAVIGATION = [
  {
    group: "Fondasi & Tata Kelola",
    items: [
      {
        name: "Dashboard Mutu",
        href: "/app/dashboard",
        icon: LayoutDashboard,
        roles: ["administrator", "journal_manager", "editor"],
      },
      {
        name: "Desk Evaluation",
        href: "/app/desk-evaluation",
        icon: ClipboardCheck,
        roles: ["administrator", "journal_manager"],
      },
      {
        name: "Tata Kelola Jurnal",
        href: "/app/journal-management",
        icon: BarChart3,
        roles: ["administrator", "journal_manager", "editor"],
      },
      {
        name: "Referensi Rubrik",
        href: "/app/indicators",
        icon: BookOpen,
        roles: ["administrator", "journal_manager", "editor"],
      },
    ],
  },
  {
    group: "Naskah & Reviewer",
    items: [
      {
        name: "Kesiapan Naskah",
        href: "/app/manuscripts",
        icon: FileText,
        roles: ["administrator", "journal_manager", "editor"],
      },
      {
        name: "Registry Reviewer",
        href: "/app/registry/reviewers",
        icon: Users,
        roles: ["administrator", "journal_manager", "editor"],
      },
    ],
  },
  {
    group: "Intelijen & Linimasa",
    items: [
      {
        name: "Intelijen Akreditasi",
        href: "/app/intelligence",
        icon: Sparkles,
        roles: ["administrator", "journal_manager", "editor"],
      },
      {
        name: "Simulator Akreditasi",
        href: "/app/simulator",
        icon: Zap,
        roles: ["administrator", "journal_manager"],
      },
      {
        name: "Timeline Editorial",
        href: "/app/timeline",
        icon: Clock,
        roles: ["administrator", "journal_manager", "editor"],
      },
    ],
  },
  {
    group: "Sistem & Komunikasi",
    items: [
      {
        name: "Template Komunikasi",
        href: "/app/communication/templates",
        icon: Mail,
        roles: ["administrator", "journal_manager"],
      },
      {
        name: "Riwayat Komunikasi",
        href: "/app/communication/history",
        icon: History,
        roles: ["administrator", "journal_manager", "editor"],
      },
      {
        name: "Pengaturan Jurnal",
        href: "/app/settings",
        icon: Settings,
        roles: ["administrator", "journal_manager"],
      },
    ],
  },
];

export function Sidebar({ profile, targetSinta, currentScore }: SidebarProps) {
  const pathname = usePathname();

  const targetKey = targetSinta || "sinta_2";
  const targetInfo = sintaTargetMap[targetKey] || { label: "Sinta 2", minScore: 70.0 };
  const scoreVal = currentScore !== undefined ? currentScore : 68.5;
  const pct = Math.min(100, Math.round((scoreVal / targetInfo.minScore) * 100));
  const gap = Number(Math.max(0, targetInfo.minScore - scoreVal).toFixed(1));

  return (
    <div
      suppressHydrationWarning
      className="hidden md:flex w-64 flex-col border-r border-border/30 bg-background/40 backdrop-blur-2xl h-screen sticky top-0 transition-all"
    >
      <div className="h-16 flex items-center px-6 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 leading-tight">
              Risenologi
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              JAMS · Quality Intelligence
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
        {NAVIGATION.map((group) => {
          const allowedItems = group.items.filter((item) => item.roles.includes(profile.role));
          if (allowedItems.length === 0) return null;
          return (
            <div key={group.group}>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5 px-3">
                {group.group}
              </div>
              <nav className="space-y-0.5">
                {allowedItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden",
                        isActive
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r-md" />
                      )}
                      <item.icon
                        className={cn(
                          "h-4 w-4 transition-transform duration-200 group-hover:scale-110 shrink-0",
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />
                      <span className="truncate flex-1">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-border/30">
        <div className="px-3 py-2.5 bg-muted/20 backdrop-blur-md rounded-xl border border-border/50 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground mb-1 text-xs">Estimasi Kesiapan Akreditasi</p>
          <div className="flex justify-between text-[10px] mb-1 font-medium">
            <span>Sinta 4 ({currentScore} Poin)</span>
            <span className="text-primary font-bold">Target: {targetInfo.label}</span>
          </div>
          <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground/80 font-medium">
            <span>{gap === 0 ? "Target Terlampaui" : `Kekurangan: +${gap} Poin`}</span>
            <span className="text-blue-500 font-semibold">Min: ≥{targetInfo.minScore} Poin</span>
          </div>
          <p className="text-[10px] mt-1 text-foreground/80 font-medium border-t border-border/20 pt-1.5 truncate">
            © 2026 Muhamad Farrel Dava Fauzan
          </p>
        </div>
      </div>
    </div>
  );
}
