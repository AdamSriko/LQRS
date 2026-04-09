"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  FileText,
  Brain,
  Terminal,
  Clapperboard,
} from "lucide-react";

const nav = [
  { href: "/input", label: "Input", icon: FileText, desc: "Log & profiles" },
  { href: "/vault", label: "Obsidian Vault", icon: Brain, desc: "Skills & memory" },
  { href: "/logs", label: "Agent Brain / Logs", icon: Terminal, desc: "Watch it think" },
  { href: "/scripts", label: "Final Scripts", icon: Clapperboard, desc: "Episodes" },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-30 flex w-full flex-col border-b border-blush-soft/60 bg-cream-muted/90 shadow-soft backdrop-blur-md lg:fixed lg:inset-y-0 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="border-b border-blush-soft/50 px-6 py-8">
        <Link href="/input" className="group flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blush-soft to-lilac-soft shadow-soft">
            <Sparkles className="h-5 w-5 text-mauve-deep" aria-hidden />
          </span>
          <div>
            <p className="font-display text-xl font-semibold tracking-tight text-mauve-deep">
              LQRS
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-rosegold-accent/90">
              Drama Engine
            </p>
            <p className="mt-1 text-xs leading-relaxed text-mauve/75">
              Lavanya &amp; Qahwtea — curated chaos at the café.
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Main">
        {nav.map(({ href, label, icon: Icon, desc }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
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

      <div className="border-t border-blush-soft/50 p-4">
        <div className="rounded-2xl bg-mint-soft/50 px-4 py-3 text-xs text-mauve/75 shadow-soft-inner">
          <p className="font-medium text-mauve-deep">Qahwtea HQ</p>
          <p className="mt-1 leading-relaxed">
            Today&apos;s special: lavender oat latte &amp; whispered alliances behind the espresso bar.
          </p>
        </div>
      </div>
    </aside>
  );
}
