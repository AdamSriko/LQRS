"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  FileText,
  Brain,
  Terminal,
  Clapperboard,
  Menu,
  X,
} from "lucide-react";
import { EngineConnectionStatus } from "@/components/EngineConnectionStatus";
import { TensionTracker } from "@/components/TensionTracker";

const nav = [
  { href: "/input", label: "Input", icon: FileText, desc: "Log & profiles" },
  { href: "/vault", label: "Obsidian Vault", icon: Brain, desc: "Skills & memory" },
  { href: "/logs", label: "Agent Brain / Logs", icon: Terminal, desc: "Watch it think" },
  { href: "/scripts", label: "Final Scripts", icon: Clapperboard, desc: "Episodes" },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Main">
      {nav.map(({ href, label, icon: Icon, desc }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`group flex items-start gap-3 rounded-2xl px-4 py-3 transition-all duration-200 ${
              active
                ? "bg-gradient-to-r from-blush-soft/90 to-lilac-soft/70 text-mauve-deep shadow-soft"
                : "text-mauve/80 hover:bg-cream-deep/80 hover:text-mauve-deep"
            }`}
          >
            <Icon
              className={`mt-0.5 h-5 w-5 shrink-0 ${
                active ? "text-rosegold-accent" : "text-lilac-deep/80 group-hover:text-rosegold-accent"
              }`}
              aria-hidden
            />
            <span>
              <span className="block font-medium">{label}</span>
              <span className="text-xs text-mauve/60">{desc}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="border-t border-blush-soft/50 p-4 space-y-3">
      <TensionTracker />
      <EngineConnectionStatus />
    </div>
  );
}

// ── Desktop sidebar ───────────────────────────────────────────────────────────

function DesktopSidebar() {
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 flex-col border-r border-blush-soft/60 bg-cream-muted/90 shadow-soft backdrop-blur-md">
      <div className="border-b border-blush-soft/50 px-6 py-8">
        <Link href="/input" className="group flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blush-soft to-lilac-soft shadow-soft">
            <Sparkles className="h-5 w-5 text-mauve-deep" aria-hidden />
          </span>
          <div>
            <p className="font-display text-xl font-semibold tracking-tight text-mauve-deep">LQRS</p>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-rosegold-accent/90">
              Drama Engine
            </p>
            <p className="mt-1 text-xs leading-relaxed text-mauve/75">
              Lavanya &amp; Qahwtea — curated chaos at the café.
            </p>
          </div>
        </Link>
      </div>
      <NavLinks />
      <SidebarFooter />
    </aside>
  );
}

// ── Mobile top bar + drawer ───────────────────────────────────────────────────

function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-blush-soft/60 bg-cream-muted/95 px-4 py-3 shadow-soft backdrop-blur-md lg:hidden">
        <Link href="/input" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blush-soft to-lilac-soft shadow-soft">
            <Sparkles className="h-4 w-4 text-mauve-deep" aria-hidden />
          </span>
          <div>
            <p className="font-display text-base font-semibold leading-none tracking-tight text-mauve-deep">
              LQRS
            </p>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rosegold-accent/90 leading-none mt-0.5">
              Drama Engine
            </p>
          </div>
        </Link>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-blush-soft/60 bg-white/70 text-mauve-deep shadow-soft transition hover:bg-cream"
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </header>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-mauve-deep/20 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-blush-soft/60 bg-cream-muted/98 shadow-glow backdrop-blur-md transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-blush-soft/50 px-6 py-5">
          <Link href="/input" onClick={() => setOpen(false)} className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blush-soft to-lilac-soft shadow-soft">
              <Sparkles className="h-5 w-5 text-mauve-deep" aria-hidden />
            </span>
            <div>
              <p className="font-display text-lg font-semibold tracking-tight text-mauve-deep">LQRS</p>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-rosegold-accent/90">
                Drama Engine
              </p>
            </div>
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-blush-soft/60 bg-white/70 text-mauve-deep transition hover:bg-cream"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <NavLinks onNavigate={() => setOpen(false)} />
        <SidebarFooter />
      </aside>
    </>
  );
}

// ── Composed export ───────────────────────────────────────────────────────────

export function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileNav />
    </>
  );
}
