"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  FolderKanban,
  LayoutGrid,
  Wrench,
  CreditCard,
  HelpCircle,
  Upload,
  Sparkles,
  Shield,
  LogOut,
  Settings,
  Search,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DEMO_USAGE } from "@/lib/data/sample";

const NAV = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/templates", label: "Templates", icon: LayoutGrid },
  { href: "/upload", label: "Tools", icon: Wrench },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/help", label: "Help", icon: HelpCircle },
];

const MOBILE_NAV = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/upload", label: "Upload", icon: Upload, primary: true },
  { href: "/templates", label: "Styles", icon: LayoutGrid },
  { href: "/account", label: "Account", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const creditPct = Math.round((DEMO_USAGE.creditsUsed / DEMO_USAGE.creditsTotal) * 100);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card/40 px-4 py-5 md:flex">
        <Logo className="px-2" />

        <div className="mt-8 flex flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="side-active"
                    className="absolute inset-0 rounded-xl bg-secondary"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <item.icon className="relative z-10 h-[18px] w-[18px]" />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Shield className="h-[18px] w-[18px]" />
            Admin
          </Link>

          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">Credits</span>
              <Badge variant="pro" className="text-[10px]">
                Pro
              </Badge>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full accent-gradient" style={{ width: `${creditPct}%` }} />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {DEMO_USAGE.creditsTotal - DEMO_USAGE.creditsUsed} of {DEMO_USAGE.creditsTotal} left
            </p>
            <Button asChild size="sm" className="mt-3 w-full">
              <Link href="/upload">
                <Upload className="h-3.5 w-3.5" /> New video
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl md:px-8">
          <div className="md:hidden">
            <Logo showText={false} />
          </div>
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search projects, styles, languages…"
              className="h-9 w-full rounded-full border border-border bg-secondary/60 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="glass" size="sm" className="hidden sm:inline-flex">
              <Link href="/upload">
                <Sparkles className="h-4 w-4" /> Create
              </Link>
            </Button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar>
                    <AvatarFallback>CF</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">Creator</span>
                    <span className="text-xs text-muted-foreground">creator@captionforge.app</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <Settings /> Account settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/pricing">
                    <CreditCard /> Billing & plans
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin">
                    <Shield /> Admin panel
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <LogOut /> Sign out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 pb-24 md:pb-0">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-background/85 px-2 py-2 backdrop-blur-xl md:hidden">
        {MOBILE_NAV.map((item) => {
          const active = pathname === item.href;
          if (item.primary) {
            return (
              <Link key={item.href} href={item.href} className="-mt-6">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl accent-gradient shadow-lg">
                  <item.icon className="h-6 w-6 text-white" />
                </span>
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-1 text-[10px] font-medium",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
