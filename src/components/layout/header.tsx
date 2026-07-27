"use client";

import { usePathname } from "next/navigation";
import { Menu, User, LogOut, Sparkles, Shield, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/features/auth/actions";
import type { UserProfile } from "@/features/accreditation/types";

interface HeaderProps {
  profile: Pick<UserProfile, "fullName" | "role">;
  statusSinta?: string | null;
}

export function Header({ profile, statusSinta }: HeaderProps) {
  const pathname = usePathname();

  const pathSegments = pathname.split("/").filter(Boolean);
  const currentSegment = pathSegments[pathSegments.length - 1] || "Dashboard";
  const pageTitle =
    currentSegment.charAt(0).toUpperCase() + currentSegment.slice(1).replace("-", " ");

  const roleDisplay = {
    administrator: "Super Admin",
    journal_manager: "Journal Manager",
    editor: "Section Editor",
  }[profile.role];

  // Dynamic Sinta Status formatting
  const sintaFormatted = statusSinta
    ? statusSinta.replace("_", " ").toUpperCase()
    : "SINTA 4";

  let targetBadgeText = "Target Sinta 3 (≥60) & Sinta 2 (≥70)";
  if (statusSinta === "sinta_3") {
    targetBadgeText = "Target Sinta 2 (≥70 Poin)";
  } else if (statusSinta === "sinta_2") {
    targetBadgeText = "Target Sinta 1 (≥85 Poin)";
  } else if (statusSinta === "sinta_1") {
    targetBadgeText = "Sinta 1 Bereputasi (Scopus Target)";
  } else if (statusSinta === "sinta_5" || statusSinta === "sinta_6") {
    targetBadgeText = "Target Sinta 4 (≥50) & Sinta 3 (≥60)";
  }

  return (
    <header
      suppressHydrationWarning
      className="h-16 border-b border-border/30 bg-background/50 backdrop-blur-2xl flex items-center justify-between px-6 sticky top-0 z-20 transition-all"
    >
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70">
            {pageTitle}
          </h2>
          <span className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary shadow-sm whitespace-nowrap">
            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse shrink-0" />
            <span>Status: {sintaFormatted} (58.5 Poin) &rarr; {targetBadgeText}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Live Notification Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sync Real-Time Active</span>
        </div>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 px-2.5 rounded-xl flex items-center gap-2.5 transition-all hover:bg-muted/50 border border-border/40 bg-background/40"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-blue-500 text-white font-bold text-xs shadow-md shadow-primary/20">
                {profile.fullName.charAt(0)}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold leading-none text-foreground truncate max-w-[120px]">
                  {profile.fullName}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight mt-0.5 font-medium">
                  {roleDisplay}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 glass border-border/50 shadow-xl" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1 p-1">
                <p className="text-sm font-bold leading-none">{profile.fullName}</p>
                <p className="text-xs text-muted-foreground font-medium">{roleDisplay}</p>
                <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 rounded px-2 py-0.5 mt-1 font-semibold w-fit">
                  @risenologi.kpmunj.org
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer transition-colors font-medium text-xs py-2"
              onClick={() => {
                const form = document.createElement("form");
                form.method = "POST";
                form.action = "/api/auth/signout";
                document.body.appendChild(form);
                signOut();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar Akun</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
