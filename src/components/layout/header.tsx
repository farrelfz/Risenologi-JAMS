"use client";

import { usePathname } from "next/navigation";
import { Menu, User, LogOut } from "lucide-react";
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
}

export function Header({ profile }: HeaderProps) {
  const pathname = usePathname();

  // Simple breadcrumb logic based on pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const currentSegment = pathSegments[pathSegments.length - 1] || "Dashboard";
  const pageTitle =
    currentSegment.charAt(0).toUpperCase() + currentSegment.slice(1).replace("-", " ");

  const roleDisplay = {
    administrator: "Administrator",
    journal_manager: "Manajer Jurnal",
    editor: "Editor",
  }[profile.role];

  return (
    <header
      suppressHydrationWarning
      className="h-16 border-b border-border/30 bg-background/40 backdrop-blur-2xl flex items-center justify-between px-6 sticky top-0 z-10 transition-all"
    >
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{pageTitle}</h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full ring-2 ring-transparent transition-all hover:ring-primary/50"
            >
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/30 text-primary shadow-inner">
                <User className="h-4 w-4" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 glass border-border/50" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profile.fullName}</p>
                <p className="text-xs leading-none text-muted-foreground">{roleDisplay}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer transition-colors"
              onClick={() => {
                const form = document.createElement("form");
                form.method = "POST";
                form.action = "/api/auth/signout";
                document.body.appendChild(form);
                signOut();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
