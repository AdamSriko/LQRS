import { Sidebar } from "./Sidebar";
import { GeneratingBadge } from "./GeneratingBadge";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-muted/30">
      <Sidebar />
      {/* Desktop: offset by sidebar width. Mobile: no left offset, sidebar is a drawer. */}
      <main className="lg:pl-72">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          {children}
        </div>
      </main>
      <GeneratingBadge />
    </div>
  );
}
